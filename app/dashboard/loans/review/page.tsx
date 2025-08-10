"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { getLoanRequests, ReviewLoanRequest } from "@/lib/supabase/server-extended/loans"
import { checkUserRole } from "@/lib/supabase/server-extended/auth-helpers"
import { Toaster, toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { formatCurrency } from "@/utils/currency"

// Define the loan type for better type safety
interface Loan {
  id: string
  amount: number
  loan_type: string
  status: "in_review" | "accepted" | "rejected"
  application_date: string
  purpose?: string
  users: {
    id: string
    name: string
    avatar_url?: string
    role?: string
    email?: string
  }
}

export default function LoanReviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!user) throw new Error("Not authenticated")
        // Only allow treasurer or super-admin
        await checkUserRole(user.id, ["treasurer", "super-admin"])
        const data = await getLoanRequests()
        setLoans(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch loans")
      } finally {
        setLoading(false)
      }
    }
    fetchLoans()
  }, [user])

  const handleReview = async (loan_id: string, approve: boolean) => {
    if (!user) {
      setError("You must be logged in to review loans.")
      return
    }
    setActionLoading(loan_id + approve)
    setError(null)
    try {
      await ReviewLoanRequest({
        loan_id,
        approved: approve,
        reviewer_id: user.id,
      })
      setLoans((loans) =>
        loans.map((l) => (l.id === loan_id ? { ...l, status: approve ? "accepted" : "rejected" } : l)),
      )
      toast.success(`Loan request ${approve ? "accepted" : "rejected"} successfully!`, {
        description: approve ? "The loan has been marked as accepted." : "The loan has been marked as rejected.",
      })
    } catch (err: any) {
      setError(err.message || "Failed to review loan")
      toast.error("Failed to review loan", { description: err.message })
    } finally {
      setActionLoading(null)
    }
  }

  // Helper function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "in_review":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Review
          </Badge>
        )
      case "accepted":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {status}
          </Badge>
        )
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold text-center">Authentication Required</h2>
            <p className="text-muted-foreground text-center mt-2">
              You must be logged in as a treasurer or super-admin to review loans.
            </p>
            <Button className="mt-6" onClick={() => router.push("/login")}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-800">Loan Requests</h1>
        <p className="text-muted-foreground mt-1">Review and manage pending loan applications</p>
      </div>

      <Card>
        <CardHeader className="bg-emerald-50 border-b border-emerald-100">
          <CardTitle>Review Applications</CardTitle>
          <CardDescription>Approve or reject loan requests submitted by members</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-rose-700">{error}</h3>
              <p className="text-muted-foreground mt-2">There was an error loading the loan requests.</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : loans.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium">No Pending Requests</h3>
              <p className="text-muted-foreground mt-2">
                All loan requests have been reviewed. Check back later for new applications.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop view - Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Applicant</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      {loans.some((loan) => loan.status === "in_review") && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={loan.users?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-800">
                                {loan.users?.name?.[0]?.toUpperCase() ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{loan.users?.name ?? "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">
                                {loan.users?.email ?? loan.users?.role ?? ""}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(loan.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {loan.loan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderStatusBadge(loan.status)}</TableCell>
                        <TableCell>
                          {loan.application_date
                            ? new Date(loan.application_date).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </TableCell>
                        {loan.status === "in_review" && (
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 mr-2"
                                    disabled={actionLoading === loan.id + true}
                                    onClick={() => handleReview(loan.id, true)}
                                  >
                                    {actionLoading === loan.id + true ? (
                                      <>
                                        <span className="mr-2">Processing</span>
                                        <span className="animate-spin">⟳</span>
                                      </>
                                    ) : (
                                      "Approve"
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Approve this loan request</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                    disabled={actionLoading === loan.id + false}
                                    onClick={() => handleReview(loan.id, false)}
                                  >
                                    {actionLoading === loan.id + false ? (
                                      <>
                                        <span className="mr-2">Processing</span>
                                        <span className="animate-spin">⟳</span>
                                      </>
                                    ) : (
                                      "Reject"
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Reject this loan request</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view - Cards */}
              <div className="md:hidden space-y-4 p-4">
                {loans.map((loan) => (
                  <Card key={loan.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={loan.users?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-800">
                            {loan.users?.name?.[0]?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{loan.users?.name ?? "Unknown"}</h3>
                          <p className="text-xs text-muted-foreground">{loan.users?.email ?? loan.users?.role ?? ""}</p>
                        </div>
                      </div>
                      {renderStatusBadge(loan.status)}
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-medium">{formatCurrency(loan.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <Badge variant="secondary" className="capitalize mt-1">
                            {loan.loan_type}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Applied</p>
                          <p>
                            {loan.application_date
                              ? new Date(loan.application_date).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {loan.status === "in_review" && (
                        <div className="flex space-x-2 mt-2">
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            size="sm"
                            disabled={actionLoading === loan.id + true}
                            onClick={() => handleReview(loan.id, true)}
                          >
                            {actionLoading === loan.id + true ? (
                              <>
                                <span className="mr-2">Processing</span>
                                <span className="animate-spin">⟳</span>
                              </>
                            ) : (
                              "Approve"
                            )}
                          </Button>
                          <Button
                            className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                            variant="outline"
                            size="sm"
                            disabled={actionLoading === loan.id + false}
                            onClick={() => handleReview(loan.id, false)}
                          >
                            {actionLoading === loan.id + false ? (
                              <>
                                <span className="mr-2">Processing</span>
                                <span className="animate-spin">⟳</span>
                              </>
                            ) : (
                              "Reject"
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Add this to your utils.ts file if it doesn't exist
// export const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD',
//   }).format(amount);
// };
