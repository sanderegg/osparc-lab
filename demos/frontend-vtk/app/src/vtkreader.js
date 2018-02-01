import 'babel-polyfill';
import 'vtk.js/Sources/favicon';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkXMLPolyDataReader from 'vtk.js/Sources/IO/XML/XMLPolyDataReader';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import {
  ColorMode,
  ScalarMode,
} from 'vtk.js/Sources/Rendering/Core/Mapper/Constants';

import style from './GeometryViewer.mcss';
import icon from './open.png';

let background = [0.3, 0.3, 0.3];
const selectorClass =
  background.length === 3 && background.reduce((a, b) => a + b, 0) < 1.5 ? style.dark : style.light;

// lut
const lutName = 'erdc_rainbow_bright';
// field
const field = '';

let renderWindow;
let renderer;

const myContainer = document.querySelector('body');

// ----------------------------------------------------------------------------
// DOM containers for UI control
// ----------------------------------------------------------------------------

const rootControllerContainer = document.createElement('div');
rootControllerContainer.setAttribute('class', style.rootController);


const fileContainer = document.createElement('div');
fileContainer.innerHTML = `<div class="${
  style.bigFileDrop
  }"/><input type="file" multiple accept=".vtr,.vtp" style="display: block;"/>`;
myContainer.appendChild(fileContainer);

const fileInput = fileContainer.querySelector('input');

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleFile(e) {
  preventDefaults(e);
  const dataTransfer = e.dataTransfer;
  const files = e.target.files || dataTransfer.files;

  if (files.length > 0) {
    myContainer.removeChild(fileContainer);
    load(myContainer, { files });
  }
}
fileInput.addEventListener('change', handleFile);

export function load(container, options) {
  /*autoInit = false;
  emptyContainer(container);*/

  if (options.files) {
    createViewer(container);
    let count = options.files.length;
    while (count--) {
      loadFile(options.files[count]);
    }
    //updateCamera(renderer.getActiveCamera());
  }
}

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = function onLoad(e) {
    var dataURL = reader.result;
    createPipeline(file.name, dataURL);
  };
  reader.readAsArrayBuffer(file);
}


function createViewer(container) {
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background,
    rootContainer: container,
    containerStyle: { height: '600px', width: '100%' },
  });
  renderer = fullScreenRenderer.getRenderer();
  renderWindow = fullScreenRenderer.getRenderWindow();
  renderWindow.getInteractor().setDesiredUpdateRate(15);
  container.appendChild(rootControllerContainer);
}


function createPipeline(fileName, fileContents) {
  const controlContainer = document.createElement('div');
  rootControllerContainer.appendChild(controlContainer);

  const presetSelector = document.createElement('select');
  presetSelector.setAttribute('class', selectorClass);
  presetSelector.innerHTML = vtkColorMaps.rgbPresetNames
    .map(
    (name) =>
      `<option value="${name}" ${
      lutName === name ? 'selected="selected"' : ''
      }>${name}</option>`
    )
    .join('');
  controlContainer.appendChild(presetSelector);

  const representationSelector = document.createElement('select');
  representationSelector.setAttribute('class', selectorClass);
  representationSelector.innerHTML = [
    'Hidden',
    'Points',
    'Wireframe',
    'Surface',
    'Surface with Edge',
  ]
    .map(
    (name, idx) =>
      `<option value="${idx === 0 ? 0 : 1}:${idx < 4 ? idx - 1 : 2}:${
      idx === 4 ? 1 : 0
      }">${name}</option>`
    )
    .join('');
  representationSelector.value = '1:2:0';
  controlContainer.appendChild(representationSelector);

  const colorBySelector = document.createElement('select');
  colorBySelector.setAttribute('class', selectorClass);
  controlContainer.appendChild(colorBySelector);

  const componentSelector = document.createElement('select');
  componentSelector.setAttribute('class', selectorClass);
  componentSelector.style.display = 'none';
  controlContainer.appendChild(componentSelector);

  // VTK pipeline    
  const vtkReader = vtkXMLPolyDataReader.newInstance();
  vtkReader.parseArrayBuffer(fileContents);

  const lookupTable = vtkColorTransferFunction.newInstance();
  const source = vtkReader.getOutputData(0);
  const mapper = vtkMapper.newInstance({
    interpolateScalarsBeforeMapping: false,
    useLookupTableScalarRange: true,
    lookupTable,
    scalarVisibility: false,
  });
  const actor = vtkActor.newInstance();
  const scalars = source.getPointData().getScalars();
  const dataRange = [].concat(scalars ? scalars.getRange() : [0, 1]);




  // --------------------------------------------------------------------
  // Color handling
  // --------------------------------------------------------------------

  function applyPreset() {
    const preset = vtkColorMaps.getPresetByName(presetSelector.value);
    lookupTable.applyColorMap(preset);
    lookupTable.setMappingRange(dataRange[0], dataRange[1]);
    lookupTable.updateRange();
  }
  applyPreset();
  presetSelector.addEventListener('change', applyPreset);

  // --------------------------------------------------------------------
  // Representation handling
  // --------------------------------------------------------------------

  function updateRepresentation(event) {
    const [
      visibility,
      representation,
      edgeVisibility,
    ] = event.target.value.split(':').map(Number);
    actor.getProperty().set({ representation, edgeVisibility });
    actor.setVisibility(!!visibility);
    renderWindow.render();
  }
  representationSelector.addEventListener('change', updateRepresentation);


  // --------------------------------------------------------------------
  // ColorBy handling
  // --------------------------------------------------------------------

  const colorByOptions = [{ value: ':', label: 'Solid color' }].concat(
    source
      .getPointData()
      .getArrays()
      .map((a) => ({
        label: `(p) ${a.getName()}`,
        value: `PointData:${a.getName()}`,
      })),
    source
      .getCellData()
      .getArrays()
      .map((a) => ({
        label: `(c) ${a.getName()}`,
        value: `CellData:${a.getName()}`,
      }))
  );
  colorBySelector.innerHTML = colorByOptions
    .map(
      ({ label, value }) =>
        `<option value="${value}" ${
          field === value ? 'selected="selected"' : ''
        }>${label}</option>`
    )
    .join('');

  function updateColorBy(event) {
    const [location, colorByArrayName] = event.target.value.split(':');
    const interpolateScalarsBeforeMapping = location === 'PointData';
    let colorMode = ColorMode.DEFAULT;
    let scalarMode = ScalarMode.DEFAULT;
    const scalarVisibility = location.length > 0;
    if (scalarVisibility) {
      const activeArray = source[`get${location}`]().getArrayByName(
        colorByArrayName
      );
      const newDataRange = activeArray.getRange();
      dataRange[0] = newDataRange[0];
      dataRange[1] = newDataRange[1];
      colorMode = ColorMode.MAP_SCALARS;
      scalarMode =
        location === 'PointData'
          ? ScalarMode.USE_POINT_FIELD_DATA
          : ScalarMode.USE_CELL_FIELD_DATA;

      const numberOfComponents = activeArray.getNumberOfComponents();
      if (numberOfComponents > 1) {
        // always start on magnitude setting
        if (mapper.getLookupTable()) {
          const lut = mapper.getLookupTable();
          lut.setVectorModeToMagnitude();
        }
        componentSelector.style.display = 'block';
        const compOpts = ['Magnitude'];
        while (compOpts.length <= numberOfComponents) {
          compOpts.push(`Component ${compOpts.length}`);
        }
        componentSelector.innerHTML = compOpts
          .map((t, index) => `<option value="${index - 1}">${t}</option>`)
          .join('');
      } else {
        componentSelector.style.display = 'none';
      }
    } else {
      componentSelector.style.display = 'none';
    }
    mapper.set({
      colorByArrayName,
      colorMode,
      interpolateScalarsBeforeMapping,
      scalarMode,
      scalarVisibility,
    });
    applyPreset();
  }
  colorBySelector.addEventListener('change', updateColorBy);
  updateColorBy({ target: colorBySelector });

  // component handling
  function updateColorByComponent(event) {
    if (mapper.getLookupTable()) {
      const lut = mapper.getLookupTable();
      if (event.target.value === -1) {
        lut.setVectorModeToMagnitude();
      } else {
        lut.setVectorModeToComponent();
        lut.setVectorComponent(Number(event.target.value));
      }
      renderWindow.render();
    }
  }
  componentSelector.addEventListener('change', updateColorByComponent);

  mapper.setInputData(source);
  actor.setMapper(mapper);
  renderer.addActor(actor);

  // Manage update when lookupTable change
  lookupTable.onModified(() => {
    renderWindow.render();
  });

  // first render
  renderer.resetCamera();
  renderer.resetCameraClippingRange();
  renderWindow.render();
}