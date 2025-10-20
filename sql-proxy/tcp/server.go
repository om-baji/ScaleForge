package tcp

import (
	"io"
	"net"

	"github.com/om-baji/cc/handlers"
	"github.com/om-baji/cc/utils"
)

func StartServer() error {
	listerner, err := net.Listen("tcp", ":5433")

	handlers.HandleError(err)

	utils.Logger().Info("[PROXY] Server started")

	go func() {
		for {
			conn, err := listerner.Accept()
			if err != nil {
				handlers.HandleError(err)
				continue
			}
			go handleConnection(conn)
		}
	}()

	return nil
}

func handleConnection(conn net.Conn) {
	defer conn.Close()

	db, err := net.Dial("tcp", "127.0.0.1:6432")
	handlers.HandleError(err)

	defer db.Close()

	go io.Copy(db, conn)
	io.Copy(conn,db)
}
