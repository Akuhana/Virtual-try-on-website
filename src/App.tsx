import { StrictMode, useContext, useState, useTransition } from 'react'
import './App.css'
import { Canvas, } from '@react-three/fiber'
import { BakeShadows, OrbitControls, Environment, AccumulativeShadows, RandomizedLight, Center } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, ToneMapping } from '@react-three/postprocessing'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLoader } from '@react-three/fiber'
import { useControls } from 'leva'
import { Mesh, MeshStandardMaterial } from 'three'
import { ModelPathContext } from './main'
import * as THREE from 'three'
function App() {
  const {lightIntensity} = useControls({lightIntensity: {value: 0.1, min: 0, max: 1}})
  return (
    <StrictMode>
      <div id="canvas-container" style={{ width: "100vw", height: "100vh" }}>
        <Canvas shadows dpr={[1, 1.5]} camera={{ position: [-1.5, 1, 4.5], fov: 40, near: 1, far: 20 }} eventPrefix="client">
          {/* Lights */}
          
          <group position={[0, -0.65, 0]}>
            <Model3D />
            
            <AccumulativeShadows temporal frames={200} color="purple" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
              <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 3, 2]} bias={0.001} />
            </AccumulativeShadows>
          </group>
          {/* <Box args={[1, 1, 1]} position={[0, 0, 0]} castShadow receiveShadow/> */}
          {/* Postprocessing */}

          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.0} mipmapBlur luminanceSmoothing={0.0} intensity={lightIntensity} />
            {/* <DepthOfField target={[0, 0, 13]} focalLength={4} bokehScale={15} height={700} /> */}
          </EffectComposer>
          <Env />
          <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.1} maxPolarAngle={Math.PI / 2.1} />
          {/* Small helper that freezes the shadows for better performance */}
        </Canvas>
      </div>
    </StrictMode>
  )
}
function Model3D() {
  const { roughness } = useControls({ roughness: { value: 1, min: 0, max: 1 } })
  const {fileURL} = useContext(ModelPathContext);
  if (!fileURL) {
    return null;
  }
  let obj = useLoader(OBJLoader, fileURL)
  try {
    obj.traverse((child) => {
      if ((child as Mesh).isMesh) { // Type assertion here
        const mesh = child as Mesh; // Explicitly type child as Mesh
        mesh.castShadow = true;
        const prevMaterial = mesh.material as MeshStandardMaterial; // Type assertion to MeshStandardMaterial
        prevMaterial.roughness = roughness;
        
        mesh.material = new MeshStandardMaterial();
        MeshStandardMaterial.prototype.copy.call(mesh.material, prevMaterial);
      }
    });
  } catch (e) {
    obj = new THREE.Group();
    alert("An error occurred while loading the model. Please try again.");
  }

  return (
    <Center top>
      <primitive object={obj} castShadow />
    </Center>
  )
}
function Env() {
  const [preset, setPreset] = useState('sunset')
  // You can use the "inTransition" boolean to react to the loading in-between state,
  // For instance by showing a message
  const [inTransition, startTransition] = useTransition()
  const { blur, backgroundIntensity } = useControls({
    blur: { value: 0.5, min: 0, max: 1 },
    backgroundIntensity: { value: 1, min: 0, max: 1 },
    preset: {
      value: preset,
      options: ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'],
      // If onChange is present the value will not be reactive, see https://github.com/pmndrs/leva/blob/main/docs/advanced/controlled-inputs.md#onchange
      // Instead we transition the preset value, which will prevents the suspense bound from triggering its fallback
      // That way we can hang onto the current environment until the new one has finished loading ...
      onChange: (value: any) => startTransition(() => setPreset(value))
    }
  })
  return <Environment preset={preset} background backgroundBlurriness={blur} backgroundIntensity={backgroundIntensity}/>
}


export default App