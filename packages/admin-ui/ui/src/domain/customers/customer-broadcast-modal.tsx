import { CustomerGroup } from "@medusajs/medusa"
import {
  useAdminCreateCustomerGroup,
  useAdminPushNotifications,
  useAdminUpdateCustomerGroup,
} from "medusa-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  CustomerGroupGeneralForm,
  CustomerGroupGeneralFormType,
} from "../../components/forms/customer-group/customer-group-general-form"
import MetadataForm, {
  getMetadataFormValues,
  getSubmittableMetadata,
} from "../../components/forms/general/metadata-form"

import Button from "../../components/fundamentals/button"
import Modal from "../../components/molecules/modal"
import useNotification from "../../hooks/use-notification"
import { getErrorMessage } from "../../utils/error-messages"
import { nestedForm } from "../../utils/nested-form"
import { useTranslation } from "react-i18next"
import PushNotificationForm, {
  PushNotificationFormType,
} from "../../components/forms/customer/push-notifications"
import { FormImage } from "../../types/shared"
import { prepareImages } from "../../utils/images"

type CustomerBroadcastModalProps = {
  open: boolean
  onClose: () => void
}

type CustomerBroadcastModalFormType = {
  general: PushNotificationFormType
}

/*
 * A modal for crating/editing customer groups.
 */
function CustomerBroadcastModal({
  onClose,
  open,
}: CustomerBroadcastModalProps) {
  const { t } = useTranslation()
  const form = useForm<CustomerBroadcastModalFormType>({
    defaultValues: getDefaultValues(),
  })

  const { mutate: update, isLoading: isUpdating } = useAdminPushNotifications()

  const notification = useNotification()

  const { reset, handleSubmit: handleFormSubmit } = form

  useEffect(() => {
    if (open) {
      reset(getDefaultValues())
    }
  }, [open, reset])

  const onSubmit = handleFormSubmit(async (data) => {
    const { general } = data
    console.error(data)

    let preppedImages: FormImage[] = []

    try {
      preppedImages = await prepareImages(data.general.images ?? [])
    } catch (error) {
      let errorMessage = t(
        "product-thumbnail-section-upload-thumbnail-error",
        "Something went wrong while trying to upload the thumbnail."
      )
      const response = (error as any).response as Response

      if (response.status === 500) {
        errorMessage =
          errorMessage +
          " " +
          t(
            "product-thumbnail-section-you-might-not-have-a-file-service-configured-please-contact-your-administrator",
            "You might not have a file service configured. Please contact your administrator"
          )
      }

      notification("Error", errorMessage, "error")
      return
    }
    const url = preppedImages?.[0]?.url

    const onSuccess = () => {
      notification("Info", "Notification Sent", "success")
      onClose()
    }

    const onError = (err: Error) => {
      notification("Error", getErrorMessage(err), "error")
    }

    update(
      {
        campaignTag: general.campaignTag as any,
        channel: general.channel,
        customerIds: general.customerIds ?? [],
        image: url,
        message: general.message!,
        title: general.title!,
      },
      {
        onSuccess,
        onError,
      }
    )
  })

  return (
    <Modal open={open} handleClose={onClose}>
      <Modal.Body>
        <Modal.Header handleClose={onClose}>
          <span className="inter-xlarge-semibold">
            {"Add Broadcast Targets"}
          </span>
        </Modal.Header>

        <form onSubmit={onSubmit}>
          <Modal.Content>
            <div className="gap-y-xlarge flex flex-col">
              <div>
                <h2 className="inter-base-semibold mb-base">
                  {t("groups-details", "Details")}
                </h2>
                <PushNotificationForm form={nestedForm(form, "general")} />
              </div>
            </div>
          </Modal.Content>

          <Modal.Footer>
            <div className="gap-x-xsmall flex w-full justify-end">
              <Button
                variant="secondary"
                className="text-small mr-2 w-32 justify-center"
                size="small"
                type="button"
                onClick={onClose}
              >
                {t("groups-cancel", "Cancel")}
              </Button>
              <Button size="small" variant="primary" type="submit">
                <span>{"Publish Notifications"}</span>
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  )
}

const getDefaultValues = (): CustomerBroadcastModalFormType | undefined => {
  return {
    general: {},
  }
}

export default CustomerBroadcastModal
