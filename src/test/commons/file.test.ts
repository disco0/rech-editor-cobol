import { assert } from 'chai';
import 'mocha';
import { File } from '../../commons/file'
import { reject } from 'q';

describe('New File Function', () => {

  // Try create a new file
  it('Create a new file', (done) => {
    let fileName = "C:\\tmp\\teste_file_vscode.txt";
    var result = new File(fileName).saveBuffer(["Teste", "123"]);
    result.then(() => {
      assert.isTrue(new File(fileName).exists());
      done();
    }).catch((e) => {
      assert.fail(e);
      done();
    });
  });

  // Try write and read a file in latin1
  it('Write and read a file in latin1', (done) => {
    let fileName = "C:\\tmp\\teste_file_vscode.txt";
    let buffer = ["Teste", "123", "àáÍíÉÓôÔãâÃ", "-_?=[]{}()/\\|.;,"]
    var result = new File(fileName).saveBuffer(buffer, "latin1");
    result.then(() => {
      new File(fileName).loadBuffer("latin1").then((b) => {
        assert.equal(buffer, b);
        done();
      }).catch(() => {
        reject();
      });
    }).catch((e) => {
      assert.fail(e);
      done();
    });
  });

  // Try write and read a file in UTF-8
  it('Write and read a file in UTF-8', (done) => {
    let fileName = "C:\\tmp\\teste_file_vscode.txt";
    let buffer = ["Teste", "123", "àáÍíÉÓôÔãâÃ", "-_?=[]{}()/\\|.;,"]
    var result = new File(fileName).saveBuffer(buffer, "UTF-8");
    result.then(() => {
      new File(fileName).loadBuffer("UTF-8").then((b) => {
        assert.equal(buffer, b);
        done();
      }).catch(() => {
        reject();
      });
    }).catch((e) => {
      assert.fail(e);
      done();
    });
  });

  // Test to append content in a file
  it('Append content in a file', (done) => {
    let file = File.tmpFile();
    let buffer = [["123"], ["àáÍíÉÓôÔãâÃ"], ["-_?=[]{}()/\\|.; "]]
    file.appendBuffer(buffer[0], "latin1").then(() => {
      file.appendBuffer(buffer[1], "latin1").then(() => {
        file.appendBuffer(buffer[2], "latin1").then(() => {
          file.loadBuffer("latin1").then((b) => {
            assert.equal(b.toString(), buffer.toString().replace(/,/g, ""));
            done();
          }).catch((e) => {
            assert.fail(e);
            done();
          });
        }).catch((e) => {
          assert.fail(e);
          done();
        });
      }).catch((e) => {
        assert.fail(e);
        done();
      });
    }).catch((e) => {
      assert.fail(e);
      done();
    });
  });
  
  // Try delete a file
  it('Delete a file', (done) => {
    let file = new File("C:\\tmp\\teste_file_vscode.txt");
    let buffer = ["Teste", "123", "àáÍíÉÓôÔãâÃ", "-_?=[]{}()/\\|.;,"]
    var result = file.saveBuffer(buffer, "UTF-8");
    result.then(() => {
      file.delete();
      assert.isFalse(new File(file.fileName).exists());
      done();
    });
  });

  // Try copy a file
  it('Copy a file', (done) => {
    let file = new File("C:\\teste_file_vscode.txt");
    let dest = new File("C:\\tmp\\teste_file_vscode.txt");
    if (dest.exists()) {
      dest.delete();
    }
    let buffer = ["Teste"]
    var result = file.saveBuffer(buffer, "UTF-8");
    result.then(() => {
      file.copy(dest.fileName, () => {
        assert.isTrue(dest.exists());
        done();
      });
    });
  });

});