kind create cluster --name local

echo -n "Setting Databse Pods"

kubectl apply -f postgres
kubectl apply -f redis

echo -n "Spinning Pods for services"

kubectl apply -f inventory
kubectl apply -f orders

echo -n "Setting up metrics and prometheus adapters"

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
