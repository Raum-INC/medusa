import { Response } from "@medusajs/medusa-js"
import { useQuery } from "@tanstack/react-query"
import { useMedusa } from "../../../contexts"
import { UseQueryOptionsWrapper } from "../../../types"
import { queryKeysFactory } from "../../utils/index"
import { PaginatedResponse } from "@medusajs/types"

const ADMIN_STATES_QUERY_KEY = `admin_states` as const

export const adminStatesKeys = queryKeysFactory(ADMIN_STATES_QUERY_KEY)

type StatesQueryKeys = typeof adminStatesKeys

export const useAdminStates = (
  query?: {},
  options?: UseQueryOptionsWrapper<
  Response<PaginatedResponse & { states: { id: number; name: string }[] }>,
    Error,
    ReturnType<StatesQueryKeys["list"]>
  >
) => {
  const { client } = useMedusa()
  const { data, ...rest } = useQuery(
    adminStatesKeys.list(query),
    () => client.admin.states.list(query),
    options
  )
  return { ...data, ...rest } as const
}
