package execution

import (
	"errors"
	"fmt"
	"os/exec"
	"time"

	"github.com/go-resty/resty/v2"
)

func ExecuteNode(node Node) error {

	fmt.Println("=================================")
	fmt.Println("EXECUTING NODE")
	fmt.Println("ID:", node.ID)
	fmt.Println("TYPE:", node.Type)
	fmt.Println("CONFIG:", node.Config)
	fmt.Println("=================================")

	switch node.Type {

	// =====================================
	// START NODE
	// =====================================

	case "start":

		fmt.Println("START NODE EXECUTED")

		time.Sleep(1 * time.Second)

	// =====================================
	// TASK NODE
	// =====================================

	case "task":

		fmt.Println("TASK NODE EXECUTED")

		time.Sleep(2 * time.Second)

	// =====================================
	// FINISH NODE
	// =====================================

	case "finish":

		fmt.Println("FINISH NODE EXECUTED")

		time.Sleep(1 * time.Second)

	// =====================================
	// HTTP NODE
	// =====================================

	case "http":

		client := resty.New().
			SetTimeout(10 * time.Second)

		url, _ := node.Config["url"].(string)

		method, ok := node.Config["method"].(string)

		if !ok || method == "" {
			method = "GET"
		}

		fmt.Println(
			"HTTP REQUEST:",
			method,
			url,
		)

		resp, err := client.R().
			Execute(method, url)

		if err != nil {

			fmt.Println(
				"HTTP ERROR:",
				err,
			)

			return err
		}

		fmt.Println(
			"HTTP STATUS:",
			resp.Status(),
		)

	// =====================================
	// DELAY NODE
	// =====================================

	case "delay":

		seconds := 5

		if val, ok := node.Config["seconds"].(float64); ok {
			seconds = int(val)
		}

		fmt.Println(
			"DELAY FOR",
			seconds,
			"SECONDS",
		)

		time.Sleep(
			time.Duration(seconds) * time.Second,
		)

	// =====================================
	// SCRIPT NODE
	// =====================================

	case "script":

		command, ok := node.Config["command"].(string)

		if !ok || command == "" {
			command = "echo hello"
		}

		fmt.Println(
			"RUN SCRIPT:",
			command,
		)

		cmd := exec.Command(
			"sh",
			"-c",
			command,
		)

		output, err := cmd.CombinedOutput()

		fmt.Println("SCRIPT OUTPUT:")
		fmt.Println(string(output))

		if err != nil {

			fmt.Println(
				"SCRIPT ERROR:",
				err,
			)

			return err
		}

	// =====================================
	// FAIL NODE
	// =====================================

	case "fail":

		fmt.Println(
			"FORCE FAIL NODE:",
			node.ID,
		)

		time.Sleep(1 * time.Second)

		return errors.New(
			"node execution failed",
		)

	// =====================================
	// UNKNOWN NODE
	// =====================================

	default:

		fmt.Println(
			"UNKNOWN NODE TYPE:",
			node.Type,
		)

		time.Sleep(1 * time.Second)
	}

	fmt.Println("NODE FINISHED:", node.ID)
	fmt.Println("=================================")

	return nil
}
