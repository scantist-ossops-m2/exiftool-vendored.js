import { logger } from "batch-cluster"
import * as _path from "node:path"
import { errorsAndWarnings } from "./ErrorsAndWarnings"
import { ExifToolTask } from "./ExifToolTask"
import { Utf8FilenameCharsetArgs } from "./FilenameCharsetArgs"
import { RawTags } from "./RawTags"

export class ReadRawTask extends ExifToolTask<RawTags> {
  static for(filename: string, exiftoolArgs: string[] = []): ReadRawTask {
    const args: string[] = [...Utf8FilenameCharsetArgs, ...exiftoolArgs]
    if (!args.includes("-json")) args.push("-json")
    const sourceFile = _path.resolve(filename)
    args.push(sourceFile)
    return new ReadRawTask(sourceFile, args)
  }

  private constructor(
    readonly sourceFile: string,
    override readonly args: string[]
  ) {
    super(args)
  }

  override toString(): string {
    return "ReadRawTask" + this.sourceFile + ")"
  }

  protected parse(data: string, err?: Error): RawTags {
    try {
      const tags = JSON.parse(data)[0]
      const { errors, warnings } = errorsAndWarnings(this, tags)
      tags.errors = errors
      tags.warnings = warnings
      return tags
    } catch (jsonError) {
      logger().error("ExifTool.ReadRawTask(): Invalid JSON", { data })
      throw err ?? jsonError
    }
  }
}
