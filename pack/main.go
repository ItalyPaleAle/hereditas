package main

import (
	"fmt"
	"net/http"
	"os/exec"
	"runtime"
	"time"

	"github.com/gobuffalo/packr/v2"
)

// Main entry-point
func main() {
	// Box with data
	box := packr.New("dist", "dist")
	http.Handle("/", http.FileServer(box))

	// Launch the web browser
	go func() {
		fmt.Println("Hereditas box listening on http://localhost:8080")
		time.Sleep(200 * time.Millisecond)
		LaunchBrowser("http://localhost:8080")
	}()

	// Start the server
	if err := http.ListenAndServe("127.0.0.1:8080", nil); err != nil {
		panic(err)
	}
}

// LaunchBrowser opens a web browser at a specified URL
func LaunchBrowser(url string) {
	switch runtime.GOOS {
	case "windows":
		exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		exec.Command("open", url).Start()
	case "linux":
		exec.Command("xdg-open", url).Start()
	}
}
