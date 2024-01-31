import { useMemo, useState } from "react"
import { Controller, useFieldArray } from "react-hook-form"
import { FormImage } from "../../../../types/shared"
import FormValidator from "../../../../utils/form-validator"
import { NestedForm } from "../../../../utils/nested-form"
import InputHeader from "../../../fundamentals/input-header"
import InputField from "../../../molecules/input"
import TextArea from "../../../molecules/textarea"
// Import React FilePond
import { FilePond, registerPlugin } from "react-filepond"

// Import FilePond styles
import FilePondPluginFilePoster from "filepond-plugin-file-poster"
import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.min.css"
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size"
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
import Button from "../../../fundamentals/button"
import PlusIcon from "../../../fundamentals/icons/plus-icon"
import EditCustomersTable from "../../../templates/customer-group-table/edit-customers-table"

// Register the plugins
registerPlugin(
  /* FilePondPluginImageExifOrientation, FilePondPluginImagePreview, */
  FilePondPluginFileValidateType,
  FilePondPluginImageEditor,
  FilePondPluginFilePoster,
  FilePondPluginFileValidateSize
)

setPlugins(plugin_crop)

export type PushNotificationFormType = {
  title?: string
  message?: string
  campaignTag?: string
  customerIds?: string[]
  customerGroupIds?: string[]
  channel?: string
  images?: FormImage[]
}

type PushNotificationFormProps = {
  form: NestedForm<PushNotificationFormType>
}

/**
 * Re-usable nested form used to submit dimensions information for products and their variants.
 * @example
 * <PushNotificationForm form={nestedForm(form, "dimensions")} />
 */
const PushNotificationForm = ({ form }: PushNotificationFormProps) => {
  const {
    register,
    path,
    control,
    formState: { errors },
  } = form

  const { replace } = useFieldArray({
    control: control,
    name: path("images"),
  })
  const [showCustomersModal, setShowCustomersModal] = useState<boolean>()

  // list of currently selected customers of a group
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])

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
    <>
      <div className="gap-large grid grid-cols-2">
        <div className="gap-large col-span-1 grid grid-cols-1">
          <InputField
            label="Title"
            placeholder="Title"
            type="text"
            {...register(path("title"), {
              required: "Title is required",
              minLength: FormValidator.minOneCharRule("Title"),
            })}
            errors={errors}
          />
          <TextArea
            label="Message"
            placeholder="Message..."
            {...register(path("message"), {
              required: "Message is required",
              minLength: FormValidator.minOneCharRule("Message"),
            })}
            errors={errors}
          />
        </div>
        {useMemo(
          () => (
            <div>
              <p className="inter-base-regular text-grey-50 mb-xsmall">
                Notification Poster
              </p>

              <FilePond
                filePosterMaxHeight={200}
                maxFileSize={"300KB"}
                acceptedFileTypes={[
                  "image/gif",
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                ]}
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
                labelIdle='1200 x 1600 (3:4) recommended, up to 300KB<br/>Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
              />
            </div>
          ),
          []
        )}

        <div className="gap-large col-span-2 grid grid-cols-3">
          <div>
            <InputHeader label="Customers" className="mb-2" />
            <Controller
              name={path("customerIds")}
              control={control}
              render={({ field: { value, onChange } }) => {

                return (
                  <>
                    {showCustomersModal && (
                      <EditCustomersTable
                        selectedCustomerIds={selectedCustomerIds}
                        setSelectedCustomerIds={setSelectedCustomerIds}
                        handleSubmit={() => {
                          onChange(selectedCustomerIds)
                          setShowCustomersModal(false)
                        }}
                        onClose={() => setShowCustomersModal(false)}
                      />
                    )}

                    {
                      <Button
                        size="medium"
                        variant="ghost"
                        type="button"
                        className="border-grey-20 w-full border"
                        onClick={() => setShowCustomersModal(true)}
                      >
                        <PlusIcon size={20} />{" "}
                        {value
                          ? `${value?.length} selected`
                          : `Choose Customers`}
                      </Button>
                    }
                  </>
                )
              }}
            />
          </div>
          <InputField
            label="Campaign Tag"
            placeholder="blackfriday24'"
            type="text"
            {...register(path("campaignTag"), {})}
            errors={errors}
          />
          <InputField
            label="Firebase Topic"
            placeholder="general"
            type="text"
            {...register(path("channel"), {})}
            errors={errors}
          />
        </div>
      </div>
    </>
  )
}

export default PushNotificationForm
