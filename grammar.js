/**
 * @file Fractch grammar for tree-sitter
 * @author grady.link <tree-sitter@grady.link>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  hidden: 1,
  or: 2,
  and: 3,
  compare: 4,
  join: 5,
  add: 6,
  mul: 7,
  unary: 8,
  postfix: 9,
};

const ARG_COMMANDS = [
  "say",
  "think",
  "ask",
  "move",
  "turn",
  "turnLeft",
  "point",
  "gotoXY",
  "goto",
  "glideXY",
  "glideTo",
  "glide",
  "pointTowards",
  "pointTowardsXY",
  "pointTowardsXYFrom",
  "setX",
  "setY",
  "changeX",
  "changeY",
  "setSize",
  "changeSize",
  "setEffect",
  "changeEffect",
  "costume",
  "backdrop",
  "backdropAndWait",
  "goForward",
  "goBackward",
  "playSound",
  "playSoundUntilDone",
  "setSoundEffect",
  "changeSoundEffect",
  "setVolume",
  "changeVolume",
  "setRotationStyle",
  "setDragMode",
  "showVariable",
  "hideVariable",
  "setPenColor",
  "setPenSize",
  "changePenSize",
  "wait",
  "waitUntil",
  "broadcast",
  "broadcastWait",
  "stop",
  "danglingNext",
];

// Commands that never take arguments.
const BARE_COMMANDS = [
  "nextCostume",
  "nextBackdrop",
  "ifOnEdgeBounce",
  "clearEffects",
  "deleteClone",
  "goFront",
  "goBack",
  "show",
  "hide",
  "resetTimer",
  "stopAllSounds",
  "clearSoundEffects",
  "penUp",
  "penDown",
  "penClear",
  "stamp",
  "gotoMouse",
  "gotoRandom",
];

/** @param {RuleOrLiteral} rule */
const commaSep1 = (rule) => seq(rule, repeat(seq(",", rule)));

export default grammar({
  name: "fractch",

  word: ($) => $.identifier,

  extras: ($) => [/\s/, $.comment],

  supertypes: ($) => [$.expression, $.statement, $.declaration],

  conflicts: ($) => [
    [$.clone_statement],
    [$.return_statement],
    [$.attribute_list],
    [$.call_statement],
    [$.sprite_declaration],
    [$.stage_declaration],
    [$.watch_declaration],
    [$.comment_declaration],
    [$.asset_declaration],
  ],

  rules: {
    source_file: ($) => repeat($._item),

    _item: ($) =>
      choice($.declaration, $.script, $.region, $.locked_script, ";"),

    comment: (_) =>
      token(
        choice(
          seq("//", /[^\n]*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
        ),
      ),

    declaration: ($) =>
      choice(
        $.use_declaration,
        $.platform_declaration,
        $.import_declaration,
        $.sprite_declaration,
        $.stage_declaration,
        $.variable_declaration,
        $.watch_declaration,
        $.comment_declaration,
        $.asset_declaration,
      ),

    use_declaration: ($) =>
      seq(
        "use",
        field("name", $.string),
        optional(seq("from", field("url", $.string))),
      ),

    platform_declaration: ($) =>
      seq(
        "platform",
        field("name", $.string),
        optional(seq("from", field("url", $.string))),
      ),

    import_declaration: ($) =>
      seq(
        "import",
        field("path", $.string),
        optional(seq("as", field("alias", $.identifier))),
      ),

    sprite_declaration: ($) =>
      seq(
        "sprite",
        optional(field("name", $.string)),
        optional($.attribute_list),
      ),

    stage_declaration: ($) => seq("stage", optional($.attribute_list)),

    variable_declaration: ($) =>
      seq(
        choice("var", "cloud"),
        field("name", choice($.identifier, $.string)),
        optional(seq("=", field("value", choice($.keep, $.expression)))),
        optional(seq("id", field("id", $.string))),
      ),

    keep: (_) => "keep",

    watch_declaration: ($) =>
      seq(
        "watch",
        field("kind", choice("var", "list")),
        field("name", choice($.identifier, $.string)),
        optional($.attribute_list),
      ),

    comment_declaration: ($) =>
      seq(
        "comment",
        field("text", choice($.string, $.raw_string)),
        optional($.attribute_list),
      ),

    asset_declaration: ($) =>
      seq(
        field("kind", choice("costume", "sound", "backdrop")),
        field("name", $.string),
        optional($.attribute_list),
      ),

    attribute_list: ($) => repeat1($.attribute),

    attribute: ($) =>
      choice(
        seq(field("name", "at"), $.coordinates),
        seq(field("name", "range"), $.coordinates),
        seq(field("name", "center"), $.coordinates),
        seq(field("name", "size"), choice($.dimensions, $.number)),
        seq(
          field(
            "name",
            choice(
              "direction",
              "volume",
              "layer",
              "costume",
              "tempo",
              "transparency",
              "bitmap",
              "rate",
              "samples",
              "tts",
              "rotation",
              "format",
              "file",
              "id",
              "for",
            ),
          ),
          $._attribute_value,
        ),
        seq(field("name", "video"), choice("on", "off", $.string)),
        seq(field("name", "current")),
        field(
          "name",
          choice(
            "visible",
            "hidden",
            "draggable",
            "large",
            "slider",
            "continuous",
            "minimized",
          ),
        ),
      ),

    _attribute_value: ($) => choice($.string, $.signed_number),

    coordinates: ($) => seq($.signed_number, ",", $.signed_number),

    dimensions: (_) => token(/\d+x\d+/),

    signed_number: ($) => seq(optional("-"), $.number),

    script: ($) => choice($.hat_script, $.def_script, $.plain_script),

    hat_script: ($) =>
      seq(
        "when",
        field("hat", $.hat),
        optional($.position),
        field("body", $.block),
      ),

    hat: ($) =>
      choice(
        alias(choice("flag", "clone", "clicked"), $.hat_event),
        seq(
          alias("broadcast", $.hat_event),
          field("name", choice($.identifier, $.string)),
        ),
        seq(
          alias("key", $.hat_event),
          field("name", choice($.identifier, $.string)),
        ),
        seq(
          alias("backdrop", $.hat_event),
          field("name", choice($.identifier, $.string)),
        ),
        $.expression,
      ),

    position: ($) => seq("at", $.coordinates),

    def_script: ($) =>
      seq(
        "def",
        field("name", $.custom_name),
        "(",
        optional(commaSep1($.parameter)),
        ")",
        repeat($.def_attribute),
        field("body", $.block),
      ),

    custom_name: (_) => token(seq("@", /[A-Za-z_][A-Za-z0-9_]*/)),

    parameter: ($) =>
      seq(
        field("name", $.identifier),
        optional(seq("(", field("display", $.string), ")")),
      ),

    def_attribute: ($) =>
      choice(
        $.string,
        "warp",
        seq("returns", "=", $.number),
        seq("color", "=", $.string),
        $.position,
      ),

    plain_script: ($) =>
      seq("script", optional($.position), field("body", $.block)),

    locked_script: ($) => seq("locked", "script", $.string),

    region: ($) =>
      seq(
        "region",
        field("name", $.string),
        "{",
        repeat(choice($.script, $.comment_declaration, $.locked_script, ";")),
        "}",
      ),

    block: ($) => seq("{", repeat($.statement), "}"),

    statement: ($) =>
      choice(
        $.if_statement,
        $.forever_statement,
        $.repeat_statement,
        $.for_statement,
        $.every_statement,
        $.until_statement,
        $.while_statement,
        $.switch_statement,
        $.break_statement,
        $.return_statement,
        $.clone_statement,
        $.local_statement,
        $.assignment_statement,
        $.command_statement,
        $.bare_command_statement,
        $.comment_declaration,
        $.call_statement,
        ";",
      ),

    if_statement: ($) =>
      seq(
        "if",
        field("condition", $.expression),
        field("consequence", $.block),
        optional(field("alternative", $.else_clause)),
      ),

    else_clause: ($) => seq("else", choice($.if_statement, $.block)),

    forever_statement: ($) => seq("forever", $.block),

    repeat_statement: ($) =>
      seq("repeat", field("count", $.expression), $.block),

    for_statement: ($) =>
      choice(
        seq(
          "for",
          field("variable", $.identifier),
          "in",
          field("iterable", $.expression),
          optional(seq("using", field("index", $.identifier))),
          $.block,
        ),
        seq(
          "for",
          field("variable", $.identifier),
          "of",
          field("iterable", $.expression),
          optional(seq("using", field("index", $.identifier))),
          $.block,
        ),
      ),

    every_statement: ($) =>
      seq("every", field("interval", $.expression), "seconds", $.block),

    until_statement: ($) =>
      seq("until", field("condition", $.expression), $.block),

    while_statement: ($) =>
      seq("while", field("condition", $.expression), $.block),

    switch_statement: ($) =>
      seq(
        "switch",
        field("value", $.expression),
        "{",
        repeat(choice($.case_clause, $.default_clause)),
        "}",
      ),

    case_clause: ($) =>
      seq(
        "case",
        field("value", $.expression),
        optional("fallthrough"),
        $.block,
      ),

    default_clause: ($) => seq("default", $.block),

    break_statement: (_) => "break",

    return_statement: ($) =>
      seq("return", optional(field("value", $.expression))),

    clone_statement: ($) => seq("clone", optional(field("target", $.string))),

    local_statement: ($) =>
      seq(
        "local",
        field("name", $.identifier),
        "=",
        field("value", $.expression),
      ),

    assignment_statement: ($) =>
      seq(
        field("target", $.expression),
        field("operator", choice("=", "+=", "-=", "++=")),
        field("value", $.expression),
      ),

    command_statement: ($) =>
      seq(field("command", $.command), $.command_arguments),

    command: (_) => choice(...ARG_COMMANDS),

    command_arguments: ($) =>
      prec.right(
        seq(
          $.expression,
          repeat(seq(choice(",", "to", "by", "for", "using"), $.expression)),
        ),
      ),

    bare_command_statement: ($) =>
      seq(alias(choice(...BARE_COMMANDS), $.command)),

    call_statement: ($) =>
      seq(
        $.expression,
        repeat(seq(optional(field("label", $.identifier)), $.block)),
      ),

    expression: ($) =>
      choice(
        $.binary_expression,
        $.hidden_value,
        $.unary_expression,
        $.call_expression,
        $.member_expression,
        $.index_expression,
        $.parenthesized_expression,
        $.shadow_expression,
        $.template_string,
        $.string,
        $.raw_string,
        $.number,
        $.boolean,
        $.null,
        $.array,
        $.object,
        $.custom_name,
        $.identifier,
      ),

    binary_expression: ($) => {
      /** @type {[number, string[]][]} */
      const table = [
        [PREC.or, ["||"]],
        [PREC.and, ["&&"]],
        [PREC.compare, ["==", "!=", "<", ">", "<=", ">="]],
        [PREC.join, ["++"]],
        [PREC.add, ["+", "-"]],
        [PREC.mul, ["*", "/", "%"]],
      ];
      return choice(
        ...table.map(([p, ops]) =>
          prec.left(
            p,
            seq(
              field("left", $.expression),
              field("operator", ops.length > 1 ? choice(...ops) : ops[0]),
              field("right", $.expression),
            ),
          )
        ),
      );
    },

    hidden_value: ($) =>
      prec.left(
        PREC.hidden,
        seq(
          field("reporter", $.expression),
          "??",
          field("hidden", $.expression),
        ),
      ),

    unary_expression: ($) =>
      prec(
        PREC.unary,
        seq(
          field("operator", choice("!", "-")),
          field("argument", $.expression),
        ),
      ),

    call_expression: ($) =>
      prec(
        PREC.postfix,
        seq(field("function", $.expression), field("arguments", $.arguments)),
      ),

    arguments: ($) =>
      seq("(", optional(seq(commaSep1($.argument), optional(","))), ")"),

    argument: ($) =>
      choice(
        $.expression,
        seq(
          optional("field"),
          field("name", $.identifier),
          ":",
          field("value", $.expression),
        ),
        seq(field("name", $.identifier), "=", field("value", $.expression)),
      ),

    member_expression: ($) =>
      prec(
        PREC.postfix,
        seq(
          field("object", $.expression),
          ".",
          field("property", $.identifier),
        ),
      ),

    index_expression: ($) =>
      prec(
        PREC.postfix,
        seq(
          field("object", $.expression),
          "[",
          field("index", $.expression),
          "]",
        ),
      ),

    parenthesized_expression: ($) => seq("(", $.expression, ")"),

    shadow_expression: ($) => prec.right(seq("shadow", $.expression)),

    array: ($) =>
      seq("[", optional(seq(commaSep1($.expression), optional(","))), "]"),

    object: ($) =>
      seq("{", optional(seq(commaSep1($.pair), optional(","))), "}"),

    pair: ($) =>
      seq(
        field("key", choice($.string, $.identifier)),
        ":",
        field("value", $.expression),
      ),

    identifier: (_) => /[A-Za-z_][A-Za-z0-9_]*/,

    number: (_) =>
      token(choice(/\d+(\.\d*)?([eE][+-]?\d+)?/, /\.\d+([eE][+-]?\d+)?/)),

    boolean: (_) => choice("true", "false"),

    null: (_) => "null",

    string: ($) =>
      seq(
        '"',
        repeat(choice($.string_content, $.escape_sequence)),
        '"',
      ),

    string_content: (_) => token.immediate(prec(1, /[^"\\\n]+/)),

    escape_sequence: (_) => token.immediate(/\\./),

    raw_string: (_) => token(seq('"""', /([^"]|"[^"]|""[^"])*/, '"""')),

    template_string: ($) =>
      seq(
        "`",
        repeat(
          choice(
            $.template_content,
            $.escape_sequence,
            $.template_substitution,
          ),
        ),
        "`",
      ),

    template_content: (_) => token.immediate(prec(1, /[^`\\$]+|\$/)),

    template_substitution: ($) => seq("${", $.expression, "}"),
  },
});
