import { TextEdit } from "vscode-languageserver";
import { FormatterInterface } from "./FormatterInterface";
import { CompletionUtils } from "../commons/CompletionUtils";
import { FormatterUtils } from "./FormatterUtils";
import { WhenFormatter } from "./WhenFormatter";
import { CommandSeparatorFormatter } from "./CommandSeparatorFormatter";

/**
 * Class to format Cobol 'evaluate'
 */
export class EvaluateFormatter implements FormatterInterface {

    /** RegExp that identifies if it is the EVALUATE clause */
    public static EVALUATE_REGEXP = /\s+(EVALUATE|evaluate).*/;

    /**
     * Generates an array of Text Edits for source code formatting
     *
     * @param line line number where cursor is positioned
     * @param column column number where cursor is positioned
     * @param lines document lines
     */
    public generate(line: number, _column: number, lines: string[]): TextEdit[] {
        let lineText = lines[line];
        let evaluateStartColumn = CompletionUtils.countSpacesAtBeginning(lineText);
        const edits: TextEdit[] = this.completeTextEditWithComma(line, lines);
        edits.push(this.createWhenTextEdit(line, evaluateStartColumn + 3));
        if (FormatterUtils.isClauseMissing(line, evaluateStartColumn, lines, ["END-EVALUATE"])) {
            edits.push(this.createEndEvaluateTextEdit(line + 1, evaluateStartColumn + 1));
        }
        return edits;
    }

    /**
     * Complete the TextEdit with comma if need
     * 
     * @param line 
     * @param lines 
     */
    private completeTextEditWithComma(line: number, lines: string[]): TextEdit[] {
        let currentLineText = lines[line];
        let previousLineText = lines[line - 1];
        let previousLineNumber = line - 1;
        if (previousLineText.endsWith(",")) {
            return [];
        }
        return [new CommandSeparatorFormatter().createKeepDotOrCommaTextEdit(previousLineText, previousLineNumber, currentLineText)];
    }

    /**
     * Creates a TextEdit with the 'WHEN' clause already formatted
     * 
     * @param line 
     * @param whenColumn 
     */
    private createWhenTextEdit(line: number, whenColumn: number): TextEdit {
        let result = new WhenFormatter().createWhenTextEdit(line, whenColumn);
        result.newText += " ";
        return result;
    }

    /**
     * Creates a TextEdit with the 'end-evaluate' clause already formatted
     * 
     * @param line line where the 'end-evaluate' clause will be inserted
     * @param column column where the 'end-evaluate' clause will be inserted
     */
    private createEndEvaluateTextEdit(line: number, column: number): TextEdit {
        let endEvaluateText = "";
        endEvaluateText = CompletionUtils.fillMissingSpaces(column, 0) + "END-EVALUATE";
        endEvaluateText = endEvaluateText.concat(CompletionUtils.separatorForColumn(column));
        endEvaluateText = endEvaluateText.concat("\n");
        return {
            range: {
                start: {
                    line: line,
                    character: 0
                },
                end: {
                    line: line,
                    character: 0
                }
            },
            newText: endEvaluateText
        };
    }
    
}