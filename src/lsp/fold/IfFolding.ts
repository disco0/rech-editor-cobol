import { CobolFoldInterface } from "./cobolFoldInterface";
import { FoldingRange } from "vscode-languageserver";
import { CompletionUtils } from "../commons/CompletionUtils";

/**
* Class to folding Cobol if blocks
*/
export class IfFolding implements CobolFoldInterface {

    mustFolding(line: string): boolean {
        return /^\s+if\s+.*/gi.test(line);
    }

    fold(line: number, lines: string[]): FoldingRange {
        let startLine = this.findStartLine(line, lines);
        let startColumn = lines[startLine].length;
        let endLine = this.findEndOfIfDeclaration(line, lines)
        return {
            startLine: startLine,
            startCharacter: startColumn,
            endLine: endLine,
            endCharacter: lines[endLine].length
        }
    }

    /**
     * Find the start line of the 'if' block
     *
     * @param line
     * @param lines
     */
    private findStartLine(line: number, lines: string[]): number {
        for (let index = line; index <= lines.length; index++) {
            let currentLine  = lines[index];
            let nextLine  = lines[index + 1];
            let words = currentLine.trim().split(" ");
            let nextWords = nextLine.trim().split(" ");
            let firtsWordOfTheNextLine = nextWords[0]
            let lastWord = words[words.length - 1]
            if (CompletionUtils.isOperator(firtsWordOfTheNextLine) || CompletionUtils.isOperator(lastWord)) {
                continue;
            }
            return index
        }
        return line;
    }

    /**
     * Find the end of the if block
     *
     * @param line
     * @param lines
     */
    private findEndOfIfDeclaration(line: number, lines: string[]): number {
        let ifDeclarationLine = lines[line];
        let ifDeclarationColumn = CompletionUtils.countSpacesAtBeginning(ifDeclarationLine);
        for (let index = line; index < lines.length; index++) {
            let currentLine = lines[index];
            let formatedCurrentLine = currentLine.trimLeft().toLowerCase();
            if (formatedCurrentLine.startsWith("end-if") || formatedCurrentLine.startsWith("else")) {
                let currentColumn = CompletionUtils.countSpacesAtBeginning(currentLine)
                if (currentColumn == ifDeclarationColumn) {
                    return index - 1;
                }
            }
        }
        return line
    }

}