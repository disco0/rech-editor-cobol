import { ParserCobol } from "../../cobol/parsercobol";
import { TextEdit, TextDocument } from "vscode-languageserver";
import { FormatterInterface } from "./FormatterInterface";
import { IfFormatter } from "./IfFormatter";
import { CommandSeparatorFormatter } from "./CommandSeparatorFormatter";
import { EvaluateFormatter } from "./EvaluateFormatter";
import { FormatterUtils } from "./FormatterUtils";

/**
 * Class to format Cobol source code
 */
export class CobolFormatter {

    /** Cobol parser */
    private parser: ParserCobol;
    /** Line where the cursor is positioned */
    private line: number;
    /** Column where the cursor is positioned */
    private column: number;
    /** Document lines */
    private lines: string[];

    /**
     * Creates an instance to generate LSP Completion Items for Cobol language
     * 
     * @param line line where the cursor is positioned
     * @param column column where the cursor is positioned
     * @param fullDocument full document information
     */
    constructor(line: number, column: number, fullDocument: TextDocument) {
        this.parser = new ParserCobol();
        this.line = line;
        this.column = column;
        this.lines = fullDocument.getText().split("\r\n");
    }

    /**
     * Formats the Cobol source code when according to what was typed
     */
    public formatWhenKeyIsPressed(): TextEdit[] {
        let currentText = this.lines[this.line - 1];
        if (this.isIfCondition(currentText)) {
            return this.generate(new IfFormatter());
        }
        if (this.isEvaluateCondition(currentText)) {
            return this.generate(new EvaluateFormatter());
        }
        if (this.isWhenCondition(currentText)) {
            return [FormatterUtils.createIndentTextEdit(this.line, 0)];
        }
        if (this.parser.getDeclaracaoParagrafo(currentText)) {
            return [FormatterUtils.createIndentTextEdit(this.line, 0, 4)];
        }
        if (this.shouldKeepDotOrComma(this.lines[this.line], this.column)) {
            return this.generate(new CommandSeparatorFormatter());
        }
        return [];
    }

    /**
     * Returns true if the current line represents an 'if' condition
     */
    private isIfCondition(currentText: string): boolean {
        if (/\s+(IF|if).*/.exec(currentText)) {
            return true;
        }
        return false;
    }

    /**
     * Returns true if the current line represents a 'when' condition
     */
    private isWhenCondition(currentText: string): boolean {
        if (/\s+(WHEN|when).*/.exec(currentText)) {
            return true;
        }
        return false;
    }

    /**
     * Returns true if the current line represents a 'evaluate' condition
     */
    private isEvaluateCondition(currentText: string): boolean {
        if (/\s+(EVALUATE|evaluate).*/.exec(currentText)) {
            return true;
        }
        return false;
    }

    /**
     * Returns true if the editor should keep dot/comma at the end of the line
     * 
     * @param currentText current line text
     * @param column column where the cursor is positioned
     */
    private shouldKeepDotOrComma(currentText: string, column: number): boolean {
        return this.endsWithDotOrComma(currentText) && column == (currentText.length - 1);
    }
    
    /**
     * Returns true if the current line ends with dot or comma
     * 
     * @param currentText current line text
     */
    private endsWithDotOrComma(currentText: string): boolean {
        return currentText.endsWith(".") || currentText.endsWith(",");
    }
    
    
    /**
      * Generates completion items with the specified implementation
      * 
      * @param completion implementation used to generate completion items
      */
    private generate(completion: FormatterInterface): TextEdit[] {
        return completion.generate(this.line, this.column, this.lines);
    }

}