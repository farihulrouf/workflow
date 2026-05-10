package execution

import (
	"fmt"
	"time"
)

func ExecuteNode(node Node) error {
	fmt.Println("Executing:", node.ID)

	switch node.Type {

	case "http":
		time.Sleep(2 * time.Second)

	case "delay":
		time.Sleep(5 * time.Second)

	case "script":
		time.Sleep(3 * time.Second)

	default:
		time.Sleep(1 * time.Second)
	}

	fmt.Println("Finished:", node.ID)

	return nil
}
