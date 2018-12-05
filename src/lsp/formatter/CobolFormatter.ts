import { ParserCobol } from "../../cobol/parsercobol";
import { TextEdit } from "vscode-languageserver";
import { CompletionUtils } from "../commons/CompletionUtils";

/**
 * Class to format Cobol source code
 */
export class CobolFormatter {

    /** Cobol parser */
    private parser: ParserCobol;

    constructor() {
        this.parser = new ParserCobol();
    }

    /**
     * Formats the Cobol source code when according to what was typed
     * 
     * @param lines all lines of the document source code
     * @param lineNumber current line where curson is positioned
     * @param colNumber current column where curson is positioned
     */
    public formatWhenKeyIsPressed(lines: string[], lineNumber: number, colNumber: number): TextEdit[] {
        let currentText = lines[lineNumber - 1];
        if (this.isIfCondition(currentText)) {
            return this.formatIfClause(lineNumber, lines);
        }
        if (this.isEvaluateCondition(currentText)) {
            return this.formatEvaluateClause(lineNumber, lines);
        }
        if (this.isWhenCondition(currentText)) {
            return [CompletionUtils.createIndentTextEdit(lineNumber, 0)];
        }
        if (this.parser.getDeclaracaoParagrafo(currentText)) {
            return [CompletionUtils.createIndentTextEdit(lineNumber, 0, 4)];
        }
        if (this.shouldKeepDotOrComma(lines[lineNumber], colNumber)) {
            return this.createKeepDotOrCommaEdit(lines[lineNumber - 1], lineNumber - 1, lines[lineNumber - 1].length, lines[lineNumber]);
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
     * Formats Cobol 'if' clause when Enter is pressed
     * 
     * @param lineNumber number of the current line
     * @param lines document lines
     */
    private formatIfClause(lineNumber: number, lines: string[]): TextEdit[] {
        let lineText = lines[lineNumber];
        const edits: TextEdit[] = [CompletionUtils.createIndentTextEdit(lineNumber, 0)];
        let ifStartColumn = CompletionUtils.countSpacesAtBeginning(lineText);
        if (this.isEndIfMissing(lineNumber, ifStartColumn, lines)) {
            edits.push(this.createEndIfTextEdit(lineNumber + 1, ifStartColumn + 1));
        }
        return edits;
    }

    /**
     * Returns true if the 'end-if' clause is missing for the current paragraph
     * 
     * @param lineNumber current line number
     */
    private isEndIfMissing(lineNumber: number, column: number, lines: string[]): boolean {
        let endIfText = CompletionUtils.fillMissingSpaces(column, 0) + " END-IF";
        let elseText = CompletionUtils.fillMissingSpaces(column, 0) + " ELSE";
        for (let index = lineNumber; index < lines.length; index++) {
            let lineText = lines[index];
            if (!this.parser.isCommentOrEmptyLine(lineText)) {
                // If it's a new paragraph declaration then the 'if' clause was not closed on the current
                // paragraph and the 'end-if' needs to be inserted
                if (this.parser.getDeclaracaoParagrafo(lineText)) {
                    return true;
                }
                // If it's a command at the same identation/column as 'if' clause
                // (the command is probably not nested inside the 'if')

                if (lineText.length < column) {
                    return true;
                }
                if (!(lineText.charAt(column) === " ")) {
                    return !(lineText.startsWith(endIfText.toUpperCase()) || lineText.startsWith(elseText.toUpperCase()));
                }
            }
        }
        return true;
    }

    /**
     * Creates a TextEdit with the 'end-if' clause already formatted
     * 
     * @param line line where the 'end-if' clause will be inserted
     * @param column column where the 'end-if' clause will be inserted
     */
    private createEndIfTextEdit(line: number, column: number): TextEdit {
        let endIfText = "";
        endIfText = CompletionUtils.fillMissingSpaces(column, 0) + "END-IF";
        endIfText = endIfText.concat(CompletionUtils.separatorForColumn(column));
        endIfText = endIfText.concat("\n");
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
            newText: endIfText
        };
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
     * Creates a text edit to prevent editor from removing dot/comma from the end of the line
     * @param previousText current line text
     * @param line line where the cursor is positioned
     * @param column column where the cursor is positioned
     * @param currentText text of the current line
     */
    private createKeepDotOrCommaEdit(_previousText: string, line: number, _column: number, currentText: string): TextEdit[] {
        const edits: TextEdit[] = [];
        edits.push(this.createDotEdit(_previousText, line, _column, currentText));
        // edits.push(this.removeRemainingLine(_previousText, line, _column, currentText));
        return edits;
    }
    
    /**
     * Returns a text edit for dot or comma
     */
    private createDotEdit(_previousText: string, line: number, _column: number, currentText: string): TextEdit {
        let targetChar = ",";
        if (currentText.trim().endsWith(".")) {
            targetChar = ".";
        }
        return {
            range: {
                start: {
                    line: line,
                    character: _column
                },
                end: {
                    line: line + 1,
                    character: _column
                }
            },
            newText: targetChar + "\n" + CompletionUtils.fillMissingSpaces(CompletionUtils.countSpacesAtBeginning(_previousText) + 1, 0)
        };
   }

    /**
     * Formats Cobol 'evaluate' clause when Enter is pressed
     * 
     * @param lineNumber number of the current line
     * @param lines document lines
     */
    private formatEvaluateClause(lineNumber: number, lines: string[]): TextEdit[] {
        let lineText = lines[lineNumber];
        let evaluateStartColumn = CompletionUtils.countSpacesAtBeginning(lineText);
        const edits: TextEdit[] = [this.createWhenTextEdit(lineNumber, evaluateStartColumn)];
        if (this.isEndEvaluateMissing(lineNumber, evaluateStartColumn, lines)) {
            edits.push(this.createEndEvaluateTextEdit(lineNumber + 1, evaluateStartColumn + 1));
        }
        return edits;
    }

    /**
     * Returns true if the 'end-evaluate' clause is missing for the current paragraph
     * 
     * @param lineNumber current line number
     */
    private isEndEvaluateMissing(lineNumber: number, column: number, lines: string[]): boolean {
        let endEvaluateText = CompletionUtils.fillMissingSpaces(column, 0) + " END-EVALUATE";
        for (let index = lineNumber; index < lines.length; index++) {
            let lineText = lines[index];
            if (!this.parser.isCommentOrEmptyLine(lineText)) {
                // If it's a new paragraph declaration then the 'evaluate' clause was not closed on the current
                // paragraph and the 'end-evaluate' needs to be inserted
                if (this.parser.getDeclaracaoParagrafo(lineText)) {
                    return true;
                }
                // If it's a command at the same identation/column as 'evaluate' clause
                // (the command is probably not nested inside the 'evaluate')
                if (lineText.length < column) {
                    return true;
                }
                if (!(lineText.charAt(column) === " ")) {
                    return !(lineText.startsWith(endEvaluateText.toUpperCase()));
                }
            }
        }
        return true;
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

    /**
     * Creates a TextEdit with the 'when' clause already formatted
     * 
     * @param line line where the 'when' clause will be inserted
     * @param column column where the 'when' clause will be inserted
     */
    private createWhenTextEdit(line: number, column: number): TextEdit {
        let textToInsert = "WHEN ";
        let endEvaluateText = "";
        endEvaluateText = CompletionUtils.fillMissingSpaces(column + 4, column) + textToInsert;
        return {
            range: {
                start: {
                    line: line,
                    character: column
                },
                end: {
                    line: line,
                    character: column
                }
            },
            newText: endEvaluateText
        };
    }    

}