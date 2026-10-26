; Comments
(comment) @comment

; Literals
(string) @string
(raw_string) @string
(template_string) @string
(string_content) @string
(template_content) @string
(escape_sequence) @string.escape
(number) @number.float
(boolean) @boolean
(null) @constant.builtin
(dimensions) @number

; Template substitution
(template_substitution
  ["${" "}"] @punctuation.special)

; Identifiers
(identifier) @variable

(parameter
  name: (identifier) @variable.parameter)

(custom_name) @function

; Calls
(call_expression
  function: (identifier) @function.call)
(call_expression
  function: (member_expression
    property: (identifier) @function.method.call))
(call_expression
  function: (custom_name) @function.call)

(member_expression
  property: (identifier) @property)

; Keyed / field arguments
(argument
  name: (identifier) @variable.parameter)
(argument "field" @keyword)
(pair
  key: (identifier) @property)

; Builtin commands
(command) @function.builtin
(command_arguments ["to" "by" "for" "using"] @keyword)

; Scripts
(hat_event) @keyword
(def_script
  name: (custom_name) @function)
(def_attribute "warp" @keyword.modifier)
(def_attribute ["returns" "color"] @property)

; Declarations
(variable_declaration
  name: (identifier) @variable)
(variable_declaration "id" @keyword.modifier)
(import_declaration
  alias: (identifier) @module)
(keep) @constant.builtin

(attribute
  name: _ @property)
(position "at" @property)

; Keywords
[
  "when" "def" "script" "region" "locked"
  "use" "platform" "import" "sprite" "stage" "var" "cloud" "watch"
  "comment" "costume" "sound" "backdrop" "local"
] @keyword

(asset_declaration kind: _ @keyword)
(watch_declaration kind: _ @keyword)

[
  "if" "else" "switch" "case" "default" "fallthrough"
] @keyword.conditional

[
  "forever" "repeat" "for" "in" "of" "every" "seconds" "until" "while"
] @keyword.repeat

(break_statement) @keyword.repeat
"return" @keyword.return
"shadow" @keyword
["from" "as" "on" "off" "using"] @keyword
(clone_statement "clone" @function.builtin)

; Operators
[
  "=" "+=" "-=" "++=" "==" "!=" "<" ">" "<=" ">="
  "+" "-" "*" "/" "%" "++" "&&" "||" "!" "??"
] @operator

; Punctuation
["(" ")" "[" "]" "{" "}"] @punctuation.bracket
["," ";" ":" "."] @punctuation.delimiter
