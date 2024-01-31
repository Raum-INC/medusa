import { useFieldArray } from "react-hook-form"
import { FormImage } from "../../../../types/shared"
import { NestedForm } from "../../../../utils/nested-form"

// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond"

// Import FilePond styles
import FilePondPluginFilePoster from "filepond-plugin-file-poster"
import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.min.css"
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type"
import "filepond/dist/filepond.min.css"
import FilePondPluginImageEditor from "../../../../assets/scripts/filepond-plugin-image-editor"
import {
  createDefaultImageReader,
  createDefaultImageWriter,
  getEditorDefaults,
  openEditor,
  plugin_crop,
  processImage,
  setPlugins,
} from "../../../../assets/scripts/pintura"
import { useMemo } from "react"

// Register the plugins
registerPlugin(
  /* FilePondPluginImageExifOrientation, FilePondPluginImagePreview, */
  FilePondPluginFileValidateType,
  FilePondPluginImageEditor,
  FilePondPluginFilePoster
)

setPlugins(plugin_crop)

export type ThumbnailFormType = {
  images: FormImage[]
}

type Props = {
  form: NestedForm<ThumbnailFormType>
}

const ThumbnailForm = ({ form }: Props) => {
  const { control, path } = form

  const { fields, remove, replace, append } = useFieldArray({
    control: control,
    name: path("images"),
  })

  const imageEditorOptions = {
    // Maps legacy data objects to new imageState objects (optional)
    // legacyDataToImageState: legacyDataToImageState,

    // Used to create the editor (required)
    createEditor: openEditor,

    // Used for reading the image data. See JavaScript installation for details on the `imageReader` property (required)
    imageReader: [createDefaultImageReader],

    // Required when generating a preview thumbnail and/or output image
    imageWriter: [createDefaultImageWriter],

    // Used to create poster and output images, runs an invisible "headless" editor instance
    imageProcessor: processImage,

    // Pintura Image Editor options
    editorOptions: {
      // Pass the editor default configuration options
      ...getEditorDefaults(),

      // This will set a square crop aspect ratio
      // placeholder="1200 x 1600 (3:4) recommended, up to 10MB each"
      imageCropAspectRatio: 3 / 4,
    },
  }

  return (
    <div className="App">
      {useMemo(
        () => (
          <FilePond
          filePosterMaxHeight={200}
            acceptedFileTypes={[
              "image/gif",
              "image/jpeg",
              "image/png",
              "image/webp",
            ]}
            server={{
              load: (source, load, error, progress, abort, headers) => {
                var myRequest = new Request(source)
                fetch(myRequest).then(function (response) {
                  response.blob().then(function (myBlob) {
                    load(myBlob)
                  })
                }).catch(error)
              },
            }}
            files={fields.map((field) => ({
              options: {
                type: "local",
              },
              source: field.url,
            }))}
            // imageEditEditor={createEditor}
            imageEditor={imageEditorOptions}
            // imageEditorInstantEdit={true}
            onaddfile={(_, file) => {
              if (_) return console.error(_)
              replace([
                {
                  url: URL.createObjectURL(file.file),
                  name: file.filename,
                  size: file.fileSize,
                  nativeFile: file.file as any,
                },
              ])
            }}
            allowMultiple={false}
            name="files" /* sets the file input name, it's filepond by default */
            labelIdle='1200 x 1600 (3:4) recommended, up to 10MB each<br/>Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
          />
        ),
        []
      )}
    </div>
  )
}

export default ThumbnailForm
