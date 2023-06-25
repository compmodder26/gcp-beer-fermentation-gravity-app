package new_batch

import (
	"fmt"
	"net/http"

	"github.com/GoogleCloudPlatform/functions-framework-go/functions"
)

func init() {
    functions.HTTP("NewBatch", newBatch)
}

func newBatch(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "New batch submitted!")
}
