import { Order } from "@medusajs/medusa"
import { useAdminReleaseCautionFeeToHost } from "medusa-react"
import { useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import Button from "../../../../components/fundamentals/button"
import Modal from "../../../../components/molecules/modal"
import TextArea from "../../../../components/molecules/textarea"
import CurrencyInput from "../../../../components/organisms/currency-input"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import FormValidator from "../../../../utils/form-validator"

type ReleaseCautionFeeFormData = {
  amount: number
  note: string
}


type ReleaseCautionFeeModalProps = {
  order: Order
  onDismiss: () => void
  initialAmount?: number
}

const ReleaseCautionFeeModal = ({
  order,
  onDismiss,
  initialAmount,
}: ReleaseCautionFeeModalProps) => {
  const { register, handleSubmit, control } = useForm<ReleaseCautionFeeFormData>({
    defaultValues: {
      amount: initialAmount,
    },
  })

  const notification = useNotification()
  const { mutate, isLoading } = useAdminReleaseCautionFeeToHost(order.id)

  const refundable = useMemo(() => {
    return order.booking![0].cautionFeePaid
  }, [order])

  const handleValidateReleaseAmount = (value) => {
    return value <= refundable
  }

  const onSubmit = (data: ReleaseCautionFeeFormData) => {
    mutate(
      {

        releaseAmount: data.amount,
        releaseNote: data.note,
      },
      {
        onSuccess: () => {
          notification(
            "Success",
            "Successfully released caution fee to host",
            "success"
          )
          onDismiss()
        },
        onError: (error) => {
          notification(
            "Error",
            getErrorMessage(error),
            "error"
          )
        },
      }
    )
  }


  return (
    <Modal handleClose={onDismiss}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Header handleClose={onDismiss}>
            <h2 className="inter-xlarge-semibold">
              {"Release Caution Fee to Host"}
            </h2>
          </Modal.Header>
          <Modal.Content>
            <span className="inter-base-semibold">
              {"Details"}
            </span>
            <div className="gap-y-base mt-4 grid">
              <CurrencyInput.Root
                size="small"
                currentCurrency={order.currency_code}
                readOnly
              >
                <Controller
                  name="amount"
                  control={control}
                  rules={{
                    required: FormValidator.required("Amount"),
                    min: FormValidator.min("Amount", 1),
                    max: FormValidator.maxInteger(
                      "Amount",
                      order.currency_code
                    ),
                  }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <CurrencyInput.Amount
                      label={"Released Amount"}
                      amount={value}
                      onBlur={onBlur}
                      invalidMessage={"Cannot refund more than the caution fee paid."}
                      onValidate={handleValidateReleaseAmount}
                      onChange={onChange}
                    />
                  )}
                />
              </CurrencyInput.Root>
              <TextArea
                {...register("note")}
                label={"Note"}
              />
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex w-full  justify-between">
              <div></div>
              <div className="gap-x-xsmall flex">
                <Button
                  onClick={onDismiss}
                  size="small"
                  className="w-[112px]"
                  variant="ghost"
                >
                  {"Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="small"
                  className="w-[112px]"
                  variant="primary"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {"Complete"}
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </form>
    </Modal>
  )
}

export default ReleaseCautionFeeModal
