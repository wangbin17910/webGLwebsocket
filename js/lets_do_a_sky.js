// 声明全局变量
var startTime	= Date.now();
var container;
//声明摄像头，场景，渲染器
var camera, scene, renderer;
var skyboxMesh;

// 检测是否有动画函数，没有则根据浏览器添加对应的函数
if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}
//初始化
init();		
animate();

function init() {
	// 检测是否支持webgl
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	// 创建摄像头
	camera = new THREE.Camera( 70, window.innerWidth / window.innerHeight, 1, 100000 );
	
	// 创建场景
	scene = new THREE.Scene();
	
	// 加载背景图
	var urlPrefix	= "Images/";
	var urls = [ urlPrefix + "posx.jpg", urlPrefix + "negx.jpg",
			urlPrefix + "posy.jpg", urlPrefix + "negy.jpg",
			urlPrefix + "posz.jpg", urlPrefix + "negz.jpg" ];
	var textureCube	= THREE.ImageUtils.loadTextureCube( urls );
	
	// 初始化材质
	var shader	= THREE.ShaderUtils.lib["cube"];
	var uniforms	= THREE.UniformsUtils.clone( shader.uniforms );
	uniforms['tCube'].texture= textureCube;
	var material = new THREE.MeshShaderMaterial({
		fragmentShader	: shader.fragmentShader,
		vertexShader	: shader.vertexShader,
		uniforms	: uniforms
	});

	//形状对象
	skyboxMesh	= new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000, 1, 1, 1, null, true ), material );

	// 添加到场景中
	scene.addObject( skyboxMesh );

	// 创建div并把canvas放到里面
	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// 初始化渲染器
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
}

function animate() {
	// 渲染3d场景
	render();
	// 调用动画
	requestAnimationFrame( animate );
}

function render() {
	// move the camera based on a timer
	var timer = - new Date().getTime() * 0.0002; 
	camera.position.x = 1000 * Math.cos( timer );
	camera.position.z = 1000 * Math.sin( timer );
 

	// 展示场景
	renderer.render( scene, camera );
}