import type {
  AddAttachmentsResult,
  ComposerAttachment,
  UploadCapability,
  UploadPluginOptions
} from "./types";

const defaultUploadOptions: Required<UploadPluginOptions> = {
  accept: [],
  maxFiles: 9,
  maxFileSize: 10 * 1024 * 1024
};

function formatAcceptedTypes(accept: string[]): string {
  return accept.join(", ");
}

export class UploadManager implements UploadCapability {
  private options: Required<UploadPluginOptions>;
  private idCounter = 0;

  constructor(options: UploadPluginOptions = {}) {
    this.options = {
      accept: options.accept ?? defaultUploadOptions.accept,
      maxFiles: options.maxFiles ?? defaultUploadOptions.maxFiles,
      maxFileSize: options.maxFileSize ?? defaultUploadOptions.maxFileSize
    };
  }

  setOptions(options: UploadPluginOptions): void {
    this.options = {
      accept: options.accept ?? this.options.accept,
      maxFiles: options.maxFiles ?? this.options.maxFiles,
      maxFileSize: options.maxFileSize ?? this.options.maxFileSize
    };
  }

  addFiles(files: File[], existingAttachments: ComposerAttachment[]): AddAttachmentsResult {
    const remainingSlots = Math.max(this.options.maxFiles - existingAttachments.length, 0);
    const added: ComposerAttachment[] = [];
    const errors: AddAttachmentsResult["errors"] = [];

    if (remainingSlots === 0 && files.length > 0) {
      return {
        added,
        errors: [
          {
            message: `You can attach up to ${this.options.maxFiles} files.`
          }
        ]
      };
    }

    files.forEach((file, index) => {
      if (index >= remainingSlots) {
        errors.push({
          file,
          message: `You can attach up to ${this.options.maxFiles} files.`
        });
        return;
      }

      if (!this.isAcceptedType(file)) {
        errors.push({
          file,
          message: `Unsupported file type. Allowed types: ${formatAcceptedTypes(this.options.accept)}`
        });
        return;
      }

      if (file.size > this.options.maxFileSize) {
        errors.push({
          file,
          message: `File "${file.name}" exceeds the ${Math.round(this.options.maxFileSize / (1024 * 1024))}MB limit.`
        });
        return;
      }

      added.push(this.normalizeFile(file));
    });

    return { added, errors };
  }

  revokeAttachment(attachment: ComposerAttachment): void {
    if (attachment.previewUrl && typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(attachment.previewUrl);
    }
  }

  revokeAll(attachments: ComposerAttachment[]): void {
    attachments.forEach((attachment) => {
      this.revokeAttachment(attachment);
    });
  }

  private normalizeFile(file: File): ComposerAttachment {
    const previewUrl =
      file.type.startsWith("image/") && typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(file)
        : undefined;

    return {
      id: `attachment-${Date.now()}-${this.idCounter++}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl,
      status: "ready"
    };
  }

  private isAcceptedType(file: File): boolean {
    if (this.options.accept.length === 0) {
      return true;
    }

    return this.options.accept.some((acceptedType) => {
      if (acceptedType.endsWith("/*")) {
        const family = acceptedType.slice(0, acceptedType.indexOf("/"));
        return file.type.startsWith(`${family}/`);
      }

      if (acceptedType.startsWith(".")) {
        return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
      }

      return file.type === acceptedType;
    });
  }
}
