package main

import (
	"encoding/base64"
	"fmt"
	"log"

	qrcode "github.com/skip2/go-qrcode"
)

func main() {
	fmt.Println("QR Engine!")

	var bits []byte

	bits, err := qrcode.Encode("https://example.org", qrcode.Medium, 256)

	if err != nil {
		log.Fatal("Failed!")
	}

	encoded := base64.StdEncoding.EncodeToString(bits)
	fmt.Println("Encoded  -> ", encoded)

	var decoded []byte

	_, _ = base64.RawStdEncoding.Decode(decoded, []byte(encoded))

	fmt.Println("Decoded -> ", decoded)

	err = qrcode.WriteFile("https://example.org", qrcode.Medium, 256, "qr.png")

	if err != nil {
		log.Fatal("Failed!")
	}
}
