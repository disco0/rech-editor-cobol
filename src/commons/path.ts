'use babel';

export class Path {
  path: string;

  constructor(path: any) {
    if (typeof path === "string") {
      this.path = path;
    } else {
      this.path = path.toString();
    }
    this.path = this.path.replace(/\//g, "\\");
  }

  /**
   * Retorna o diretório com barra no final
   */
  directory() {
    if (this.path.endsWith("\\")) {
      return this.path;
    } else {
      return this.path.substring(0, this.path.lastIndexOf('\\') + 1);
    }
  }

  fileName() {
    return this.path.substring(this.path.lastIndexOf('\\') + 1, this.path.length);
  }

  baseName() {
    const fileName = this.fileName();
    return fileName.substring(0, fileName.lastIndexOf('.'));
  }

  extension() {
    const fileName = this.fileName();
    return fileName.substring(fileName.lastIndexOf('.'));
  }

  fullPath() {
    return this.path;
  }

  /**
   * Return the fullPath in Windows format
   */
  fullPathWin() {
    return this.path.replace(/\//g, "\\").replace("file:\\\\\\", "").replace("%3A", ":").replace(/%5C/gi, "\\");
  }

  /**
   * Return the fullPath in Vscode format
   */
  fullPathVscode() {
    return "file:///" + this.path.replace(/\\/g, "\/").replace(/:/g, "%3A").replace("%3A", ":").replace(/\\/gi, "%5C");
  }

  /**
   * Retorna um novo Path com um nome diferente
   */
  setFileName(fileName: string) {
    return new Path(this.directory() + fileName);
  }

  toString() {
    return this.path;
  }

}
