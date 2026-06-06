import { UploadManager } from "../UploadManager";
import type { ComposerCore } from "../ComposerCore";
import type { ComposerPlugin, UploadPluginOptions } from "../types";

export class UploadPlugin implements ComposerPlugin {
  name = "upload-plugin";
  private readonly manager: UploadManager;

  constructor(private readonly options: UploadPluginOptions = {}) {
    this.manager = new UploadManager(options);
  }

  install(composer: ComposerCore): void {
    composer.registerUploadCapability(this.manager);
    composer.setUploadConstraints(this.options);
  }
}
