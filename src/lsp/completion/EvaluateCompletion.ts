import { CompletionItemKind, CompletionItem, InsertTextFormat } from "vscode-languageserver";
import { CompletionInterface } from "./CompletionInterface";
import { CompletionUtils } from "../commons/CompletionUtils";

// Cobol column for a variable of evaluate declaration
const VAR_COLUMN_DECLARATION = 35;
/**
 * Class to generate LSP Completion Items for Cobol evaluate declarations
 */
export class EvaluateCompletion implements CompletionInterface {

    public generate(_line: number, column: number, _lines: string[]): Promise<CompletionItem[]> {
        return new Promise((resolve) => {
            const text = "evaluate" + CompletionUtils.fillSpacesFromWordReplacementEnd(VAR_COLUMN_DECLARATION, column, _lines[_line], "evaluate") + "true";
            resolve(
                [{
                    label: 'EVALUATE command',
                    detail: 'Generates the declaration of EVALUATE command',
                    insertText: text,
                    insertTextFormat: InsertTextFormat.Snippet,
                    filterText: "evaluate",
                    preselect: true,
                    kind: CompletionItemKind.Keyword
                }]
            );
        });
    }

}