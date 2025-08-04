// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Custom/ProgressBar" {

Properties {
	_Color ("Color", Color) = (0.2,0.2,0.2,0.2)
	_MainTex ("Main Tex (RGBA)", 2D) = "white" {}
	_Progress ("Progress", Range(0.0,1.0)) = 0.0
}
 
SubShader {
    Tags  {"RenderType"="Opaque"}
	Blend SrcAlpha OneMinusSrcAlpha
	Pass {
	 
CGPROGRAM
#pragma vertex vert
#pragma fragment frag
#include "UnityCG.cginc"
#include "Lighting.cginc"
uniform sampler2D _MainTex;
uniform float4 _Color;
uniform float _Progress;
 
struct v2f {
	float4 pos : POSITION;
	float2 uv : TEXCOORD0;
	float light : _LightColor;
};

v2f vert (appdata_base v)
{
	v2f o;
	o.pos = UnityObjectToClipPos (v.vertex);
	o.uv = TRANSFORM_UV(0);
	 
	return o;
}
 
float4 frag( v2f i ) : SV_TARGET
{
	float4 color = tex2D( _MainTex, i.uv);
	color *= i.uv.x < _Progress;
	return float4(color*_Color*_LightColor0);
}
 
ENDCG
 
	}
}
 
}