import { useQuery } from '@tanstack/react-query'
import { fetchMyRequests } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { requestListSchema, type RequestRow } from '@/features/requests/data/schema'
import { RequestsTable } from '@/features/requests/components/requests-table'
import { requestColumns } from '@/features/requests/components/requests-columns'

export function RecentSales() {
  const user = useAuthStore((s) => s.auth.user)
  const { data } = useQuery({
    queryKey: ['requests', 'mine', user?.accountNo],
    queryFn: async () => {
      if (!user?.accountNo) return []

      const list = await fetchMyRequests(user.accountNo)
      const mapped: RequestRow[] = list.map((r) => ({
        id: String(r.id ?? ''),
        type: r.type,
        description: r.description,
        status: r.status,
        createdAt: r.createdDate ? new Date(r.createdDate) : new Date(),
        updatedAt: r.resolvedDate ? new Date(r.resolvedDate) : new Date(),
      }))
      const parsed = requestListSchema.safeParse(mapped)
      return parsed.success ? parsed.data : mapped
    },
    enabled: !!user?.accountNo,
  })

  return <RequestsTable data={data ?? []} columns={requestColumns} />
}
