'use babel';
import { Editor } from '../editor/editor';
import * as Colunas from './colunas';

export default class GeradorCobol {
  editor: Editor;

  constructor() {
    this.editor = new Editor();
  }

  /**
   * Insert a command "MOVE"
   */
  async move() {
    await this.editor.type("MOVE");
    await this.gotoCol(Colunas.COLUNA_A);
  }

  /**
   * Insert a command "SPACES"
   */
  spaces() {
    this.editor.type("SPACES");
  }

  /**
   * Insert a command "ZEROS"
   */
  zeros() {
    this.editor.type("ZEROS");
  }

  /**
   * Insert a command "LOW-VALUES"
   */
  lowvalues() {
    this.editor.type("LOW-VALUES");
  }

  /**
   * Insert a command "To"
   */
  async to() {
    await this.gotoColTo();
    await this.editor.type("TO");
    await this.gotoCol(Colunas.COLUNA_C);
  }

  /**
   * Copy entire line to clipboard wherever the cursor is
   */
  copyLine() {
    let cursor = this.editor.getCursor();
    this.editor.selectWholeLines();
    this.editor.clipboardCopy();
    this.editor.setCursor(cursor.line, cursor.character);
  }

  /**
   * Paste clipboard in a new line wherever the cursor is
   */
  pasteLine() {
    let cursor = this.editor.getCursor();
    this.editor.cursorLineStart();
    this.editor.clipboardPaste();
    this.editor.setCursor(cursor.line, cursor.character);
  }

  /**
   * Insert a new line above, keeping the cursor in the same position
   */
  async newLineAbove() {
    let position = this.editor.getCursor().character;
    await this.editor.insertLineAbove();
    await this.editor.setColumn(position);
  }
  
  /**
   * Insert a comment line above 
   */
  async insertCommentLine() {
    await this.editor.insertLineAbove();
    await this.editor.type("      *>-> ");
  }


  /**
   * Adiciona um comentário
   */
  // comment(commentText: string) {
  //   this.editor.insertSnippetAboveCurrentLineNoIdent("      *>-> ");
  //   this.type(commentText);
  // }

  /**
   * Vai para a coluna do TO
   */
  gotoColTo() {
    if (this.editor.getCurrentLineSize() < Colunas.COLUNA_B) {
      return this.gotoCol(Colunas.COLUNA_B);
    } else {
      if (this.editor.getCurrentLineSize() >= 31) {
        return this.gotoCol(Colunas.COLUNA_C);
      } else {
        return this.editor.type(" ");
      }
    }
  }

  /**
   * Vai para uma coluna
   */
  gotoCol(coluna: number) {
    if (this.editor.getCurrentLineSize() < coluna - 1) {
      return this.editor.setColumn(coluna - 1);
    } else {
      return this.editor.type(" ");
    }
  }
};