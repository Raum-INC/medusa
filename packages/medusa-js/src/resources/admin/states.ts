import { PaginatedResponse } from "@medusajs/types"
import qs from "qs"
import { ResponsePromise } from "../../typings"
import BaseResource from "../base"

class AdminStatesResource extends BaseResource {

  /**
   * @description lists states in a country matching a query
   * @param query query for searching states
   * @param customHeaders
   * @returns a list of states matching the query.
   */
  list(
    query?: {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<PaginatedResponse & {states: {id: number, name: string}[]}> {
    let path = `/admin/states`

    if (query) {
      const queryString = qs.stringify(query)
      path = `/admin/states?${queryString}`
    }

    return this.client.request("GET", path, undefined, {}, customHeaders)
  }
}

export default AdminStatesResource
