import type { User } from "./auth";

export type CreateOrgRequest = {
  name: string
  slug: string
  url: string
}


export type GetMembersResponse = {
  members: User[]
  totalCount: number
}

export type GetMembersRequest = {
  page?: number
  pageSize?: number
}

export type Organization = {
    id: string
    name: string
    slug: string
    url: string
    iconUrl: string
  }
  