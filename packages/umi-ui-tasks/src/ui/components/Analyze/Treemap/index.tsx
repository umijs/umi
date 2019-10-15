import { Component } from 'react';
import FoamTree from './carrotsearch_foamtree';

interface IProps {
  className: string;
  ref: any;
  data: any;
  onMouseLeave: any;
  onGroupHover: any;
  weightProp: string;
}

export default class Treemap extends Component<IProps, any> {
  private treemap = null;
  private node = null;

  componentDidMount() {
    this.treemap = this.createTreemap();
    window.addEventListener('resize', this.resize);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    this.treemap.dispose();
  }

  render() {
    const { className, data, onMouseLeave } = this.props;
    return (
      <div className={className} data={data} onMouseLeave={onMouseLeave} ref={this.saveNodeRef} />
    );
  }

  saveNodeRef = node => (this.node = node);

  getTreemapDataObject(data = this.props.data) {
    return { groups: data };
  }

  createTreemap() {
    const component = this;
    const { props } = this;
    return new FoamTree({
      element: this.node,
      layout: 'squarified',
      stacking: 'flattened',
      pixelRatio: window.devicePixelRatio || 1,
      maxGroups: Infinity,
      maxGroupLevelsDrawn: Infinity,
      maxGroupLabelLevelsDrawn: Infinity,
      maxGroupLevelsAttached: Infinity,
      groupMinDiameter: 0,
      groupLabelVerticalPadding: 0.2,
      rolloutDuration: 0,
      pullbackDuration: 0,
      fadeDuration: 0,
      // groupFillType: 'gradient',
      attributionTheme: 'light',
      groupExposureZoomMargin: 0.2,
      zoomMouseWheelDuration: 300,
      openCloseDuration: 200,
      dataObject: this.getTreemapDataObject(),
      // color
      rainbowStartColor: 'hsl(240, 12%, 21%)',
      rainbowEndColor: 'hsl(240, 12%, 21%)',
      rainbowSaturationCorrection: 1,

      titleBarDecorator(opts, props, vars) {
        vars.titleBarShown = false;
      },
      onGroupHover(event) {
        if (event.group && event.group.attribution) {
          event.preventDefault();
          return;
        }

        if (props.onGroupHover) {
          props.onGroupHover.call(component, event);
        }
      },
    });
  }

  resize = () => {
    this.treemap.resize();
  };
}
