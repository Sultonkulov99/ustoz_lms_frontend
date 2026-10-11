"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  SlidersVertical,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { AddAdminModal, type AddAdminFormData } from "@/components/modals/add-admin-modal";
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal";
import { SuccessModal } from "@/components/modals/success-modal";
import { apiFetch } from "@/lib/api-client";
import { useLanguage } from "@/contexts/LanguageContext";

type Admin = {
  id: string;
  name: string;
  avatar: any;
  phone: string;
  createdAt: string;
  role: "SUPER_ADMIN" | "ADMIN";
  password: string;
  status: "ACTIVE" | "INACTIVE";
};

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function getInitial(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ["#BC000D", "#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DB2777"];
  if (!name) return colors[0];
  const charCode = name.trim().toUpperCase().charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

function mapUsers(items: any[]): Admin[] {
  return items.map((item: any) => ({
    id: String(item.id),
    name: item.fullName || "—",
    avatar: item.image ? `/files/public/${item.image}` : null,
    phone: item.phone || "",
    createdAt: item.createdAt
      ? item.createdAt.replace("T", " ").substring(0, 19)
      : "",
    role: item.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
    password: item.password || "•••••••",
    status: item.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
  }));
}

export function AdminsList() {
  const { t } = useLanguage();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessageKey, setSuccessMessageKey] = useState<"common.successAdded" | "common.successUpdated" | "common.successDeleted">("common.successAdded");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchVal, setSearchVal] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchInput(searchVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"ALL" | "ADMIN" | "SUPER_ADMIN">("ALL");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const searchParam = searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : "";

        if (selectedRoleFilter === "ADMIN") {
          const response = await apiFetch(`/users?limit=${itemsPerPage}&offset=${offset}&role=ADMIN${searchParam}`);
          if (response.ok) {
            const resData = await response.json();
            if (resData && Array.isArray(resData.data)) {
              setAdmins(mapUsers(resData.data));
              setTotalCount(resData.total || resData.data.length);
            }
          }
        } else if (selectedRoleFilter === "SUPER_ADMIN") {
          const response = await apiFetch(`/users?limit=${itemsPerPage}&offset=${offset}&role=SUPER_ADMIN${searchParam}`);
          if (response.ok) {
            const resData = await response.json();
            if (resData && Array.isArray(resData.data)) {
              setAdmins(mapUsers(resData.data));
              setTotalCount(resData.total || resData.data.length);
            }
          }
        } else {
          const [res1, res2] = await Promise.all([
            apiFetch(`/users?limit=${itemsPerPage}&offset=${offset}&role=ADMIN${searchParam}`),
            apiFetch(`/users?limit=${itemsPerPage}&offset=${offset}&role=SUPER_ADMIN${searchParam}`)
          ]);
          let mergedData: any[] = [];
          let total = 0;
          if (res1.ok) {
            const d1 = await res1.json();
            if (Array.isArray(d1.data)) mergedData = [...mergedData, ...d1.data];
            total += d1.total || 0;
          }
          if (res2.ok) {
            const d2 = await res2.json();
            if (Array.isArray(d2.data)) mergedData = [...mergedData, ...d2.data];
            total += d2.total || 0;
          }
          setAdmins(mapUsers(mergedData.slice(0, itemsPerPage)));
          setTotalCount(total);
        }
      } catch (err) {
        console.error("Admins fetch error:", err);
      }
    };
    fetchAdmins();
  }, [currentPage, itemsPerPage, searchInput, selectedRoleFilter, reloadTrigger]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAdmins = admins;
  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, totalCount);

  const editingAdmin = admins.find((admin) => admin.id === editingAdminId) ?? null;
  const editingAdminFormData: Partial<AddAdminFormData> | undefined = editingAdmin
    ? {
        fullName: editingAdmin.name,
        phone: editingAdmin.phone,
        password: editingAdmin.password,
      }
    : undefined;

  const handleClearSearch = () => {
    setSearchVal("");
    setSearchInput("");
    setCurrentPage(1);
  };

  const handleAddAdmin = async (data: AddAdminFormData) => {
    try {
      const response = await apiFetch("/users/create/admin", {
        method: "POST",
        body: JSON.stringify({
          phone: data.phone,
          fullName: data.fullName,
          password: data.password,
          status: "ACTIVE",
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Error");
      }

      setSuccessMessageKey("common.successAdded");
      setIsSuccessModalOpen(true);
      setReloadTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message || "Error");
    }
  };

  const handleEditAdmin = (data: AddAdminFormData) => {
    if (!editingAdminId) return;
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === editingAdminId
          ? {
              ...admin,
              name: data.fullName,
              phone: data.phone || "—",
              password: data.password ? "•".repeat(data.password.length) : "—",
            }
          : admin
      )
    );
    setEditingAdminId(null);
    setSuccessMessageKey("common.successUpdated");
    setIsSuccessModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await apiFetch(`/users/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Error");
      }

      setDeleteTargetId(null);
      setSuccessMessageKey("common.successDeleted");
      setIsSuccessModalOpen(true);
      setReloadTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(err.message || "Error");
    }
  };

  const handleExportXls = async () => {
    const XLSX = await import("xlsx");
    try {
      const searchParam = searchInput.trim() ? `&search=${encodeURIComponent(searchInput.trim())}` : "";
      let allData: any[] = [];

      const fetchRoleChunks = async (role: string) => {
        let offset = 0;
        const limit = 500;
        let hasMore = true;
        while (hasMore) {
          const res = await apiFetch(`/users?limit=${limit}&offset=${offset}&role=${role}${searchParam}`);
          if (res.ok) {
            const d = await res.json();
            if (d && Array.isArray(d.data)) {
              allData = [...allData, ...d.data];
              if (d.data.length < limit || allData.length >= (d.total || 0)) {
                hasMore = false;
              } else {
                offset += limit;
              }
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }
      };

      if (selectedRoleFilter === "ALL" || selectedRoleFilter === "ADMIN") {
        await fetchRoleChunks("ADMIN");
      }
      if (selectedRoleFilter === "ALL" || selectedRoleFilter === "SUPER_ADMIN") {
        await fetchRoleChunks("SUPER_ADMIN");
      }

      if (allData.length > 0) {
        const rows = allData.map((admin: any) => ({
          ID: admin.id,
          [t("table.fullName")]: admin.fullName || "—",
          [t("table.phone")]: admin.phone || "",
          [t("table.createdAt")]: admin.createdAt ? admin.createdAt.slice(0, 19).replace("T", " ") : "",
          [t("table.role")]: admin.role === "SUPER_ADMIN" ? t("role.superAdmin") : t("role.admin"),
          [t("table.status")]: admin.status === "ACTIVE" ? t("status.active") : t("status.inactive"),
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t("users.admins"));
        XLSX.writeFile(workbook, "administratorlar.xlsx");
      }
    } catch (err) {
      console.error("XLS Export error:", err);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const PaginationControls = () => (
    <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#374151]">
      <span className="mr-1 whitespace-nowrap">{t("pagination.perPage")}</span>
      <div className="mr-3 inline-block">
        <PageLimitDropdown
          value={itemsPerPage}
          onChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
        />
      </div>

      {getVisiblePages(safePage, totalPages).map((page, idx) =>
        page === "..." ? (
          <span key={`e-${idx}`} className="px-1">...</span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(Number(page))}
            className="font-inter flex size-8 items-center justify-center rounded-md text-sm font-medium"
            style={{
              border: page === safePage ? "1px solid #E0E3E6" : "none",
              background: page === safePage ? "#ffffff" : "transparent",
              color: page === safePage ? "#0D1017" : "#636C79",
            }}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(safePage + 1)}
        disabled={safePage === totalPages}
        className="font-inter ml-1 flex h-8 items-center whitespace-nowrap rounded-md border border-[#E0E3E6] px-3 text-sm font-medium text-[#0D1017] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("pagination.next")}
      </button>
    </div>
  );

  const RangeInfo = () => (
    <div className="flex flex-wrap items-center gap-3 text-sm text-[#374151]">
      <span>
        {t("pagination.showingRange")} {rangeStart}-{rangeEnd} {t("pagination.to")} {t("pagination.total")} {totalCount}{t("pagination.items")}
      </span>
      <button
        onClick={handleExportXls}
        className="font-inter flex items-center gap-1.5 rounded-md border border-[#E0E3E6] bg-white px-2.5 py-1.5 text-[13px] text-[#0D1017]"
      >
        <div className="relative flex h-4 w-3.5 items-center justify-center">
          <img src="/images/admin/Page.png" alt="excel" className="h-auto w-full" />
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[5px] font-extrabold leading-none tracking-tighter text-white">
            XLS
          </span>
        </div>
        <span>({totalCount}) {t("pagination.downloadXls")}</span>
      </button>
    </div>
  );

  const AdminAvatar = ({ admin, size }: { admin: Admin; size: number }) => (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size, background: getAvatarColor(admin.name) }}
    >
      {admin.avatar ? (
        <img
          loading="lazy"
          src={admin.avatar}
          alt={admin.name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = "none";
            const fallback = img.parentElement?.querySelector(".avatar-fallback") as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className="avatar-fallback font-inter flex h-full w-full items-center justify-center font-bold text-white"
        style={{ display: admin.avatar ? "none" : "flex", fontSize: size * 0.42 }}
      >
        {getInitial(admin.name)}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Sarlavha va breadcrumb */}
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("users.admins")}</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("users.usersLabel")} <span className="mx-1">•</span> {t("users.admins")}
          </p>
        </div>

        <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          {t("common.add")}
        </Button>
      </div>

      {/* Qidiruv */}
      <div className="mb-5 sm:mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
            }}
            placeholder={t("common.search")}
            className="font-inter h-10 w-full rounded-lg border border-[#E0E3E6] bg-white pl-10 pr-10 text-sm text-[#0D1017] outline-none"
          />
          {searchVal ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground hover:text-foreground"
              aria-label={t("common.clearFilter")}
            >
              <X className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground hover:text-foreground"
              aria-label={t("common.filter")}
            >
              <SlidersVertical size={16} color={selectedRoleFilter !== "ALL" ? "#2563EB" : "#374151"} />
            </button>
          )}

          {/* Role Filter Dropdown */}
          {filterOpen && (
            <div className="absolute right-0 top-[46px] z-20 w-44 rounded-lg border border-[#E0E3E6] bg-white py-1.5 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
              {[
                { key: "ALL", label: t("common.allRoles") },
                { key: "SUPER_ADMIN", label: t("role.superAdmin") },
                { key: "ADMIN", label: t("role.admin") },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setSelectedRoleFilter(opt.key as typeof selectedRoleFilter);
                    setCurrentPage(1);
                    setFilterOpen(false);
                  }}
                  className="font-inter w-full px-3 py-2 text-left text-[13px] text-[#0D1017]"
                  style={{
                    background: selectedRoleFilter === opt.key ? "#F3F4F6" : "transparent",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Qidiruv natijasi haqida ma'lumot */}
      {searchInput && (
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          &quot;{searchInput}&quot; ({totalCount})
          <button
            type="button"
            onClick={handleClearSearch}
            className="ml-2 text-primary underline hover:no-underline"
          >
            {t("common.clearFilter")}
          </button>
        </p>
      )}

      {/* ── Mobil: karta ko'rinishi (<640px) ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {paginatedAdmins.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#636C79]">
            {t("common.noData")}
          </div>
        ) : (
          paginatedAdmins.map((admin) => (
            <div
              key={admin.id}
              className="rounded-2xl border border-[#F0F1F2] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <AdminAvatar admin={admin} size={36} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-[#0D1017]">
                    {admin.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#636C79]">{admin.phone}</p>
                </div>
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: admin.status === "ACTIVE" ? "#F0FDF4" : "#FEF2F2",
                    color: admin.status === "ACTIVE" ? "#16A34A" : "#DC2626",
                  }}
                >
                  {admin.status === "ACTIVE" ? t("status.active") : t("status.inactive")}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#F5F5F5] pt-3">
                <span className="text-xs text-[#636C79]">
                  {admin.role === "SUPER_ADMIN" ? t("role.superAdmin") : t("role.admin")}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingAdminId(admin.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.edit")}
                  >
                    <Pencil size={14} color="#374151" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(admin.id)}
                    className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                    aria-label={t("common.delete")}
                  >
                    <Trash2 size={14} color="#DC2626" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── sm va undan katta: jadval ko'rinishi (≥640px) ── */}
      <div className="hidden overflow-hidden rounded-xl border border-[#E0E3E6] bg-white sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E0E3E6] bg-[#F9FAFB]">
                <th className="hidden w-[80px] border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  {t("table.id")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.fullName")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] md:table-cell">
                  {t("table.phone")}
                </th>
                <th className="hidden border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017] lg:table-cell">
                  {t("table.createdAt")}
                </th>
                <th className="border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.role")}
                </th>
                <th className="w-[100px] border-r border-[#E0E3E6] px-4 py-3.5 text-left font-semibold text-[#0D1017]">
                  {t("table.status")}
                </th>
                <th className="w-[100px] px-4 py-3.5 text-center font-semibold text-[#0D1017]">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.map((admin) => (
                <tr key={admin.id} className="border-b border-[#E0E3E6]">
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#0D1017] lg:table-cell">
                    {admin.id}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4">
                    <div className="flex items-center gap-3">
                      <AdminAvatar admin={admin} size={32} />
                      <span className="font-medium text-[#0D1017]">{admin.name}</span>
                    </div>
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] md:table-cell">
                    {admin.phone}
                  </td>
                  <td className="hidden border-r border-[#E0E3E6] px-4 py-4 text-[#636C79] lg:table-cell">
                    {admin.createdAt}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4 text-[#636C79]">
                    {admin.role}
                  </td>
                  <td className="border-r border-[#E0E3E6] px-4 py-4">
                    <span
                      className="inline-block whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold"
                      style={{
                        background: admin.status === "ACTIVE" ? "#F0FDF4" : "#FEF2F2",
                        color: admin.status === "ACTIVE" ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {admin.status === "ACTIVE" ? t("status.active") : t("status.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAdminId(admin.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label="Tahrirlash"
                      >
                        <Pencil size={14} color="#374151" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(admin.id)}
                        className="flex size-8 items-center justify-center rounded-md border border-[#E0E3E6] bg-white"
                        aria-label="O'chirish"
                      >
                        <Trash2 size={14} color="#DC2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedAdmins.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#636C79]">
                    {searchInput
                      ? `"${searchInput}" bo'yicha hech narsa topilmadi`
                      : "Ma'lumot topilmadi"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pastki panel */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <RangeInfo />
        <PaginationControls />
      </div>

      <AddAdminModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddAdmin}
      />

      <AddAdminModal
        open={editingAdminId !== null}
        onOpenChange={(open) => !open && setEditingAdminId(null)}
        onSubmit={handleEditAdmin}
        mode="edit"
        initialData={editingAdminFormData}
      />

      <SuccessModal
        open={isSuccessModalOpen}
        onOpenChange={setIsSuccessModalOpen}
        title={t(successMessageKey)}
      />

      <DeleteConfirmModal
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}