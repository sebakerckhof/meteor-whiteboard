import { Whiteboards } from './whiteboards';
import { Paths } from '../paths/paths';

/**
 * This renders the SVG for a given whiteboard id
 * It calculates the bounding box around all paths to set the correct viewBox attribute
 * Currently unused, since most mail clients can't show SVG and we convert to PNG on the client side
 * @param id
 * @returns {*|string}
 */
const calculateSVG = (id) => {

  const paths = Paths.find({whiteboard:id},{sort:{dateAdded:1},fields:{d:1,size:1,color:1,bb:1}}).fetch();

  //calculate bounding box;
  let bb = paths.reduce((bb,path) => ({
    x: Math.min(path.bb.x, bb.x),
    y: Math.min(path.bb.y, bb.y),
    width: Math.max(path.bb.width, bb.width),
    height: Math.max(path.bb.height, bb.height),
  }),{
    x:Number.POSITIVE_INFINITY,
    y:Number.POSITIVE_INFINITY,
    width:Number.NEGATIVE_INFINITY,
    height:Number.NEGATIVE_INFINITY
  });

  const svg =`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
        <svg preserveAspectRatio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg" pointer-events="none" viewBox="${bb.x} ${bb.y} ${bb.width} ${bb.height}" style="background-color: #ffffff;">
        ${ paths.map(path => `<path fill="none" d="${path.d}" stroke="${path.color}" stroke-width="${path.size}" />`).join('') }
        </svg>`.trim();
  return svg;
};

export {
  calculateSVG
};