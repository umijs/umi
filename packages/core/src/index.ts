import Config from './Config/Config';
import { IConfig } from './Config/types';
import Html from './Html/Html';
import { IHTMLTag, IScriptConfig, IStyleConfig } from './Html/types';
import Logger from './Logger/Logger';
import Route from './Route/Route';
import { IRoute } from './Route/types';
import { PluginType } from './Service/enums';
import PluginAPI from './Service/PluginAPI';
import Service, { IServiceOpts } from './Service/Service';
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
export { Logger };
