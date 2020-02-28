let mat4=glMatrix.mat4;
var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms
var flagD=true;
var flagO=true;
var counter=0;
var counter1=0;

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

// TO DO: Create the functions for each of the figures.

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function createPiramid(gl, translation,rotationAxis){
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let verts=[
        .5,0,0, //0
        .15,0,-.48,//1
        .15,0,.48,//2

        .15,0,-.48,//1
        .15,0,.48,//2
        -0.4,0,-.29,//3

        .15,0,.48,//2
        -0.4,0,-.29,//3
        -0.4, 0, 0.29,//4

        -0.4,0,-.29,//3
        -0.4, 0, 0.29,//4
        0,1,0,//5
        
        .15,0,-.48,//1
        -0.4,0,-.29,//3
        0,1,0,//5

        .5,0, 0,//0
        .15,0,-.48,//1
        0,1,0,//5

        .5,0, 0,//0
        .15,0,.48,//2
        0,1,0,//5

        .15,0,.48,//2
        -0.4, 0, 0.29,//4
        0,1,0,//5
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // base
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0]  // Left face
    ];

    let vertexColors = [
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
    ];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    console.log(vertexColors)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let piramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, piramidIndexBuffer);


    let piramidIndices=[
        0,1,2,  3,4,5,  6,7,8, //base
        9,10,11,  12,13,14, 17,15,16, 18,19,20, 21,22,23
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(piramidIndices), gl.STATIC_DRAW);
    
    let piramid = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:piramidIndexBuffer,
        vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

mat4.translate(piramid.modelViewMatrix, piramid.modelViewMatrix, translation);

piramid.update = function()
{
    let now = Date.now();
    let deltat = now - this.currentTime;
    this.currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    // Rotates a mat4 by the given angle
    // mat4 out the receiving matrix
    // mat4 a the matrix to rotate
    // Number rad the angle to rotate the matrix by
    // vec3 axis the axis to rotate around
    mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
};

return piramid;

}

function createDodecahedron(gl, translation,rotationAxis, rotationAxis1){
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let verts=[
        .62,-1.62,0, //N
        -.62,-1.62,0,//P
        0,-.62,1.62,//K

        0,-.62,1.62,//K
        .62,-1.62,0,//N
       1,-1,1,//B

        0,-.62,1.62,//K
        -.62,-1.62,0,//P
        -1,-1,1,//B

        1.62,0,.62, //Q
        0,-.62,1.62,//K
        0,.62,1.62,//I

        1.62,0,.62, //Q
        0,-.62,1.62,//K
        1,-1,1,//B

        1.62,0,.62, //Q
        1,1,1,//A
        0,.62,1.62,//I

        0,-.62,1.62,//K
        0,.62,1.62,//I
       -1.62,0,.62,//S

       0,.62,1.62,//I
       -1.62,0,.62,//S
        -1,1,1,//D

        0,-.62,1.62,//K
       -1.62,0,.62,//S
        -1,-1,1,//C

        .62,1.62,0,//M
        -.62,1.62,0,//O
        0,.62,1.62,//I

        -.62,1.62,0,//O
        0,.62,1.62,//I
        -1,1,1,//D
        
        .62,1.62,0,//M
        1,1,1,//A
        0,.62,1.62,//I

        -1.62,0,.62,//S
        -.62,-1.62,0,//P
        -1.62,0,-.62,//T

        -1.62,0,.62,//S
        -.62,-1.62,0,//P
        -1,-1,1,//C

        -1,-1,-1,//G
        -.62,-1.62,0,//P
        -1.62,0,-.62,//T

        -1.62,0,.62,//S
        -.62,1.62,0,//O
        -1.62,0,-.62,//T

        -1.62,0,.62,//S
        -.62,1.62,0,//O
        -1,1,1,//D

        -1,1,-1,//H
        -.62,1.62,0,//O
        -1.62,0,-.62,//T

        -1.62,0,-.62,//T
        0,.62,-1.62,//J
        0,-.62,-1.62,//L

        -1.62,0,-.62,//T
       -1,-1,-1,//G
        0,-.62,-1.62,//L

        -1.62,0,-.62,//T
        0,.62,-1.62,//J
        -1,1,-1,//H

        .62,-1.62,0, //N
        -.62,-1.62,0,//P
        0,-.62,-1.62,//L

        .62,-1.62,0, //N
        1,-1,-1, //F
        0,-.62,-1.62,//L

        -1,-1,-1,//G
        -.62,-1.62,0,//P
        0,-.62,-1.62,//L

        1.62,0,-.62,//R
        0,-.62,-1.62,//L
        0,.62,-1.62,//J

        1.62,0,-.62,//R
        0,-.62,-1.62,//L
        1,-1,-1,//F

        1.62,0,-.62,//R
        1,1,-1,//E
        0,.62,-1.62,//J

        -1.62,0,-.62,//T
        0,.62,-1.62,//J
        0,-.62,-1.62,//L

        -1.62,0,-.62,//T
        -1,-1,-1,//G
        0,-.62,-1.62,//L

        -1.62,0,-.62,//T
        0,.62,-1.62,//J
        -1,1,-1,//H

        1.62,0,-.62,//R
        1.62,0,.62, //Q
        .62,1.62,0,//M

        1,1,1,//A
        1.62,0,.62, //Q
        .62,1.62,0,//M

        1.62,0,-.62,//R
        1,1,-1, //E
        .62,1.62,0,//M

        1.62,0,-.62,//R
        1.62,0,.62, //Q
        .62,-1.62,0, //N
        
        1,-1,1,//B
        1.62,0,.62, //Q
        .62,-1.62,0, //N

        1.62,0,-.62,//R
        1,-1,-1,//F
        .62,-1.62,0, //N

        .62,1.62,0,//M
        -.62,1.62,0,//O
        0,.62,-1.62,//J

        .62,1.62,0,//M
        1,1,-1,//E
        0,.62,-1.62,//J

        -1,1,-1,//H
        -.62,1.62,0,//O
        0,.62,-1.62,//J
    ]

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // base
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0],
        [.3, .5, .8, 1.0], // Right face // base
        [0.1, 0, 0.7, 1.0], // Back face
        [0.2, .5, 1.0, 1.0], // Top face
        [1.0, 0, 0.3, 1.0], // Bottom face
        [0, 0.2, 1.0, 1.0], // Right face
        [0, 0.3, .6, 1.0],
        [1, 1, 1, 1.0], // Right face
        
           // Left face
    ];

    let vertexColors = [
    ];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 9; j++)
            vertexColors.push(...color);
    });

    console.log(vertexColors)

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);


    let dodecahedronIndices=[
        0,1,2,  3,4,5,  6,7,8, //base
        9,10,11,  12,13,14, 17,15,16, 
        18,19,20, 21,22,23, 24,25,26,
        27,28,29, 30,31,32, 33,34,35,
        36,37,38, 39,40,41, 42,43,44,
        45,46,47, 48,49,50, 51,52,53,
        54,55,56, 57,58,59, 60,61,62,
        63,64,65, 66,67,68, 69,70,71,
        72,73,74, 75,76,77, 78,79,80,
        81,82,83, 84,85,86, 87,88,89,
        90,91,92, 93,94,95, 96,97,98,
        99,100,101, 102,103,104, 105,106,107,
        108,109,110, 111,112,113, 114,115,116

    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);
    
    let dodecahedron = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
        vertSize:3, nVerts:verts.length/3, colorSize:4, nColors: vertexColors.length, nIndices:dodecahedronIndices.length,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

dodecahedron.update = function()
{
    let now = Date.now();
    let deltat = now - this.currentTime;
    this.currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    // Rotates a mat4 by the given angle
    // mat4 out the receiving matrix
    // mat4 a the matrix to rotate
    // Number rad the angle to rotate the matrix by
    // vec3 axis the axis to rotate around
    if(flagD){
        if(counter%10==0){
            flagD=false
            
        }
        counter++
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    }else{
        if(counter%10==0){
            flagD=false
        }
        counter++
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis1);
    }
   

    
};

return dodecahedron;

}


function createOctahedron(gl, translation,rotationAxis){
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Front face
        1.0, 0,  0,
        0, 0,  1.0,
        0,  1.0,  0,

       // Back face
       -1.0, 0,  0,
        0, 0,  1.0,
        0,  1.0,  0,

       // Top face
       1.0, 0,  0,
        0, 0,  -1.0,
        0,  1.0,  0,

       // Bottom face
       -1.0, 0,  0,
        0, 0,  -1.0,
        0,  1.0,  0,

       // Front face
       1.0, 0,  0,
       0, 0,  1.0,
       0,  -1.0,  0,

      // Back face
      -1.0, 0,  0,
       0, 0,  1.0,
       0,  -1.0,  0,

      // Top face
      1.0, 0,  0,
       0, 0,  -1.0,
       0,  -1.0,  0,

      // Bottom face
      -1.0, 0,  0,
       0, 0,  -1.0,
       0,  -1.0,  0,
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0],
        [.3, .5, .8, 1.0], // Right face
        [1.0, .4, .2, 1.0]  // Left face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let octahedronIndices = [
        0,1,2,3,4,5,6,7,8,9,10,11,
        12,13,14,15,16,17,18,19,20,21,22,23
    ];

    console.log(vertexColors)

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);
    
    let octahedron = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    octahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        if(flagO){
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0,.02,0]);
            counter1++
            if(counter1%100==0){
                flagO=false
                
            }
            
            
        }else{
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0,-.02,0]);
            counter1++
            if(counter1%100==0){
                flagO=true
            }
            
            
        }

    };
    
    return octahedron;
}


function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
