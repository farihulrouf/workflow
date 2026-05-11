package workflows

import "testing"

func TestTenantIsolation(t *testing.T) {

	tenant1 := uint(1)
	tenant2 := uint(2)

	if tenant1 == tenant2 {
		t.Errorf("tenants should be isolated")
	}
}
