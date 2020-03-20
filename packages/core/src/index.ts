import Config from './Config/Config';
import { IConfig } from './Config/types';
import Html from './Html/Html';
import { IScriptConfig, IStyleConfig, IHTMLTag } from './Html/types';
import Route from './Route/Route';
import { IRoute } from './Route/types';
import Service, { IServiceOpts } from './Service/Service';
import PluginAPI from './Service/PluginAPI';
import UmiError from './Logger/UmiError';
import Logger from './Logger/Logger';
import { PluginType } from './Service/enums';
import { isPluginOrPreset } from './Service/utils/pluginUtils';

export {
  Config,
  Html,
  Route,
  Service,
  PluginAPI,
  isPluginOrPreset,
  PluginType,
};
export { IRoute, IConfig, IServiceOpts, IScriptConfig, IStyleConfig, IHTMLTag };
export { Logger, UmiError };
