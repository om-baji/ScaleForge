package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"strings"
	"time"
)

type K8sResponse struct {
	Items []map[string]interface{} `json:"items"`
}

type Deployment struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Ready string `json:"ready"`
	Image string `json:"image"`
}

type Service struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Type       string  `json:"type"`
	ClusterIP  string  `json:"clusterIP"`
	Ports      string  `json:"ports"`
	ExternalIP *string `json:"externalIP"`
}

type Pod struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Status   string `json:"status"`
	Ready    string `json:"ready"`
	Restarts int    `json:"restarts"`
	Age      string `json:"age"`
}

type ClusterData struct {
	Deployments []Deployment `json:"deployments"`
	Services    []Service    `json:"services"`
	Pods        []Pod        `json:"pods"`
}

func getNestedString(m map[string]interface{}, keys ...string) string {
	var current interface{} = m
	for _, key := range keys {
		if mp, ok := current.(map[string]interface{}); ok {
			current = mp[key]
		} else {
			return ""
		}
	}
	if str, ok := current.(string); ok {
		return str
	}
	return ""
}

func getNestedFloat(m map[string]interface{}, keys ...string) float64 {
	var current interface{} = m
	for _, key := range keys {
		if mp, ok := current.(map[string]interface{}); ok {
			current = mp[key]
		} else {
			return 0
		}
	}
	if num, ok := current.(float64); ok {
		return num
	}
	return 0
}

func calculateAge(creationTime string) string {
	layout := "2006-01-02T15:04:05Z"
	t, err := time.Parse(layout, creationTime)
	if err != nil {
		return "unknown"
	}

	duration := time.Since(t)
	days := int(duration.Hours() / 24)
	hours := int(duration.Hours()) % 24
	minutes := int(duration.Minutes()) % 60

	if days > 0 {
		return fmt.Sprintf("%dd %dh", days, hours)
	} else if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, minutes)
	}
	return fmt.Sprintf("%dm", minutes)
}

func transformData(rawData []byte) (*ClusterData, error) {
	var k8sResp K8sResponse
	if err := json.Unmarshal(rawData, &k8sResp); err != nil {
		return nil, err
	}

	data := &ClusterData{
		Deployments: []Deployment{},
		Services:    []Service{},
		Pods:        []Pod{},
	}

	for i, item := range k8sResp.Items {
		kind := getNestedString(item, "kind")

		switch kind {
		case "Deployment":
			name := getNestedString(item, "metadata", "name")
			replicas := int(getNestedFloat(item, "status", "replicas"))
			readyReplicas := int(getNestedFloat(item, "status", "readyReplicas"))

			// Get first container image
			containers, ok := item["spec"].(map[string]interface{})["template"].(map[string]interface{})["spec"].(map[string]interface{})["containers"].([]interface{})
			image := "unknown"
			if ok && len(containers) > 0 {
				if container, ok := containers[0].(map[string]interface{}); ok {
					image = getNestedString(container, "image")
				}
			}

			data.Deployments = append(data.Deployments, Deployment{
				ID:    fmt.Sprintf("%d", i+1),
				Name:  name,
				Ready: fmt.Sprintf("%d/%d", readyReplicas, replicas),
				Image: image,
			})

		case "Service":
			name := getNestedString(item, "metadata", "name")
			if name == "kubernetes" {
				continue
			}

			serviceType := getNestedString(item, "spec", "type")
			clusterIP := getNestedString(item, "spec", "clusterIP")

			ports := ""
			if portsArray, ok := item["spec"].(map[string]interface{})["ports"].([]interface{}); ok && len(portsArray) > 0 {
				portsList := []string{}
				for _, p := range portsArray {
					if portMap, ok := p.(map[string]interface{}); ok {
						port := int(getNestedFloat(portMap, "port"))
						targetPort := port
						if tp, ok := portMap["targetPort"].(float64); ok {
							targetPort = int(tp)
						}
						portsList = append(portsList, fmt.Sprintf("%d:%d", port, targetPort))
					}
				}
				ports = strings.Join(portsList, ",")
			}

			data.Services = append(data.Services, Service{
				ID:         fmt.Sprintf("%d", len(data.Services)+1),
				Name:       name,
				Type:       serviceType,
				ClusterIP:  clusterIP,
				Ports:      ports,
				ExternalIP: nil,
			})

		case "Pod":
			name := getNestedString(item, "metadata", "name")
			phase := getNestedString(item, "status", "phase")
			creationTime := getNestedString(item, "metadata", "creationTimestamp")

			containerStatuses, _ := item["status"].(map[string]interface{})["containerStatuses"].([]interface{})
			readyCount := 0
			totalCount := len(containerStatuses)
			restarts := 0

			for _, cs := range containerStatuses {
				if csMap, ok := cs.(map[string]interface{}); ok {
					if ready, ok := csMap["ready"].(bool); ok && ready {
						readyCount++
					}
					restarts += int(getNestedFloat(csMap, "restartCount"))
				}
			}

			data.Pods = append(data.Pods, Pod{
				ID:       fmt.Sprintf("%d", len(data.Pods)+1),
				Name:     name,
				Status:   phase,
				Ready:    fmt.Sprintf("%d/%d", readyCount, totalCount),
				Restarts: restarts,
				Age:      calculateAge(creationTime),
			})
		}
	}

	return data, nil
}

func main() {
	http.HandleFunc("/cluster", func(w http.ResponseWriter, r *http.Request) {
		// CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		cmd := exec.Command("kubectl", "get", "all", "-o", "json")
		var out bytes.Buffer
		cmd.Stdout = &out
		if err := cmd.Run(); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
			return
		}

		clusterData, err := transformData(out.Bytes())
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "Failed to transform data: %v"}`, err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(clusterData)
	})

	fmt.Println("Server running on http://localhost:8080/cluster")
	http.ListenAndServe(":8080", nil)
}
