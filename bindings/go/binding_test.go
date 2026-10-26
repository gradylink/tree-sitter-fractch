package tree_sitter_fractch_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_fractch "github.com/gradylink/tree-sitter-fractch/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_fractch.Language())
	if language == nil {
		t.Errorf("Error loading FRACTCH grammar")
	}
}
