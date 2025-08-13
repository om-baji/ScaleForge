# QR code Generator 
[Refrence Link](https://www.twilio.com/en-us/blog/developers/tutorials/building-blocks/generate-qr-code-with-go)

```bash
 go run main.go 
``` 
In the qr-engine directory 

``` bash
go get github.com/skip2/go-qrcode 
```
For getting the qr-code Library 

``` bash
curl -X POST \
    --form "size=256" \
    --form "content=https://twilio.com" \
    --output data/qrcode.png \
    http://localhost:8080/generate
```

For getting the Qr you can change the content 

