const stream = require('stream');

let stdout = new stream.PassThrough();
let stderr = new stream.PassThrough();

export default stdout;