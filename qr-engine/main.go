package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "strconv"

    qrcode "github.com/skip2/go-qrcode"
)

type simpleQRCode struct {
	Content string 
	Size int 
}

func (code *simpleQRCode) Generate() ([]byte, error) {
    qrCode, err := qrcode.Encode(code.Content, qrcode.Medium, code.Size)
    if err != nil {
        return nil, fmt.Errorf("could not generate a QR code: %v", err)
    }
    return qrCode, nil
}

func handleRequest(writer http.ResponseWriter, request *http.Request) {
    request.ParseMultipartForm(10 << 20)
    var size, content string = request.FormValue("size"), request.FormValue("content")
    var codeData []byte

    writer.Header().Set("Content-Type", "application/json")

    if content == "" {
        writer.WriteHeader(400)
        json.NewEncoder(writer).Encode(
            "Could not determine the desired QR code content.",
        )
        return
    }

    qrCodeSize, err := strconv.Atoi(size)
    if err != nil || size == "" {
        writer.WriteHeader(400)
        json.NewEncoder(writer).Encode("Could not determine the desired QR code size.")
        return
    }

    qrCode := simpleQRCode{Content: content, Size: qrCodeSize}
    codeData, err = qrCode.Generate()
    if err != nil {
        writer.WriteHeader(400)
        json.NewEncoder(writer).Encode(
            fmt.Sprintf("Could not generate QR code. %v", err),
        )
        return
    }

    writer.Header().Set("Content-Type", "image/png")
    writer.Write(codeData)
}

func main() {
	fmt.Println("Starting port 8081 localhost")
	http.HandleFunc("/generate", handleRequest)
	if err := http.ListenAndServe(":8081", nil); err != nil {
		fmt.Println("Server error:", err)
	}
}
