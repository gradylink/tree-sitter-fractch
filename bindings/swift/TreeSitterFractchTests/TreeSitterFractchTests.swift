import XCTest
import SwiftTreeSitter
import TreeSitterFractch

final class TreeSitterFractchTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_fractch())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading FRACTCH grammar")
    }
}
