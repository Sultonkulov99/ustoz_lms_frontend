"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersVertical,
  X,
} from "lucide-react";
import { CommentGroup, CommentItem } from "./types";
import { SuccessModal } from "./SuccessModal";
import { DeleteModal } from "./DeleteModal";
import { CommentModal } from "./CommentModal";
import { PageLimitDropdown } from "@/components/ui/page-limit-dropdown";
import { useLanguage } from "@/contexts/LanguageContext";

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function CommentsList() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState<CommentGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentEditingGroup, setCurrentEditingGroup] = useState<CommentGroup | null>(null);
  const [currentEditingComment, setCurrentEditingComment] = useState<CommentItem | null>(null);
  const [currentDeletingId, setCurrentDeletingId] = useState<string | null>(null);

  // Success message state
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successType, setSuccessType] = useState<"add" | "edit" | "delete">("add");

  // Filtering groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        g.authorName.toLowerCase().includes(query) ||
        g.id.includes(query) ||
        g.comments.some((c) => c.content.toLowerCase().includes(query))
      );
    });
  }, [groups, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedGroups = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, safePage, itemsPerPage]);

  const rangeStart = filteredGroups.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const rangeEnd = Math.min(safePage * itemsPerPage, filteredGroups.length);
  const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  // Reset page on search or limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Actions
  const handleAddComment = (data: any) => {
    // Check if group with authorName already exists
    const existingGroupIndex = groups.findIndex(
      (g) => g.authorName.toLowerCase() === data.authorName.toLowerCase().trim()
    );

    const newCommentItem: CommentItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: data.content,
      rating: data.rating,
      date: data.date,
      hasActions: data.hasActions,
    };

    if (existingGroupIndex > -1) {
      setGroups((prev) =>
        prev.map((g, idx) =>
          idx === existingGroupIndex
            ? { ...g, comments: [...g.comments, newCommentItem] }
            : g
        )
      );
    } else {
      const newGroup: CommentGroup = {
        id: String(groups.length + 1),
        authorName: data.authorName.trim(),
        comments: [newCommentItem],
      };
      setGroups((prev) => [...prev, newGroup]);
    }

    setIsAddOpen(false);
    setSuccessType("add");
    setSuccessMessage("Yangi izoh muvaffaqiyatli qo'shildi!");
    setIsSuccessOpen(true);
  };

  const handleEditClick = (group: CommentGroup, comment: CommentItem) => {
    setCurrentEditingGroup(group);
    setCurrentEditingComment(comment);
    setIsEditOpen(true);
  };

  const handleEditComment = (data: any) => {
    if (!currentEditingGroup || !currentEditingComment) return;

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === currentEditingGroup.id) {
          return {
            ...g,
            authorName: data.authorName, // update authorName of the group
            comments: g.comments.map((c) =>
              c.id === currentEditingComment.id
                ? {
                    ...c,
                    content: data.content,
                    rating: data.rating,
                    date: data.date,
                    hasActions: data.hasActions,
                  }
                : c
            ),
          };
        }
        return g;
      })
    );

    setIsEditOpen(false);
    setSuccessType("edit");
    setSuccessMessage("Izoh muvaffaqiyatli tahrirlandi!");
    setIsSuccessOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCurrentDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!currentDeletingId) return;

    // Filter comments out of groups, and delete groups that become empty
    setGroups((prev) =>
      prev
        .map((g) => ({
          ...g,
          comments: g.comments.filter((c) => c.id !== currentDeletingId),
        }))
        .filter((g) => g.comments.length > 0)
    );

    setIsDeleteOpen(false);
    setSuccessType("delete");
    setSuccessMessage("Izoh muvaffaqiyatli o'chirildi!");
    setIsSuccessOpen(true);
    setCurrentDeletingId(null);
  };

  const handleExportXLS = () => {
    alert("Excel yuklab olish simulyatsiya qilindi.");
  };

  // Shared Pagination Controls Component matching PaymentsList.tsx exactly
  const PaginationControls = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#374151" }}>
      <span style={{ marginRight: "4px", whiteSpace: "nowrap" }}>{t("common.perPage")}</span>
      <div style={{ marginRight: "12px", display: "inline-block" }}>
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
          <span key={`e-${idx}`} style={{ padding: "0 4px" }}>...</span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              border: page === safePage ? "1px solid #E0E3E6" : "none",
              background: page === safePage ? "#ffffff" : "transparent",
              color: page === safePage ? "#0D1017" : "#636C79",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(safePage + 1)}
        disabled={safePage === totalPages}
        style={{
          height: "32px",
          borderRadius: "6px",
          border: "1px solid #E0E3E6",
          background: "transparent",
          cursor: safePage === totalPages ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          opacity: 1,
          color: "#0D1017",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: "14px",
          marginLeft: "4px",
        }}
      >
        {t("common.next")}
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#0D1017] m-0">{t("sidebar.comments")}</h1>
          <p className="text-xs md:text-sm text-[#636C79] mt-1">
            {t("sidebar.users")} <span className="mx-1">•</span> {t("sidebar.comments")}
          </p>
        </div>
      </div>

      {/* Search + Pagination — bitta qatorda (Figma va PaymentsList.tsx kabi) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Search input with filter icon inside */}
        <div style={{ position: "relative", width: "320px", flexShrink: 0 }}>
          <Search size={16} color="#636C79" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("common.searchPlaceholder")}
            style={{
              width: "100%",
              height: "40px",
              border: "1px solid #E0E3E6",
              borderRadius: "8px",
              paddingLeft: "40px",
              paddingRight: "40px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              color: "#0D1017",
              outline: "none",
              boxSizing: "border-box",
              background: "#ffffff",
            }}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              aria-label={t("common.clearSearch")}
            >
              <X size={14} color="#9CA3AF" />
            </button>
          ) : (
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              <SlidersVertical size={16} color="#374151" />
            </span>
          )}
        </div>

        {/* Pagination on top right */}
        <PaginationControls />
      </div>

      {/* Main Table */}
      <div style={{ border: "1px solid #E0E3E6", borderRadius: "12px", overflowX: "auto", background: "#ffffff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E0E3E6" }}>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6", width: "60px" }}>
                {t("table.id")}
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6", width: "180px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {t("table.commentAuthor")}
                  <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                </div>
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {t("table.comment")}
                  <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                </div>
              </th>
              <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 600, color: "#0D1017", borderRight: "1px solid #E0E3E6", width: "140px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {t("table.date")}
                  <img src="/images/admin/Icon@2x.png" alt="sort" style={{ width: "10px", height: "auto", marginLeft: "auto", marginRight: "6px" }} />
                </div>
              </th>
              <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 600, color: "#0D1017", width: "110px" }}>
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedGroups.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#636C79" }}>
                  {t("table.noCommentsFound")}
                </td>
              </tr>
            ) : (
              paginatedGroups.flatMap((group) =>
                group.comments.map((comment, index) => {
                  const isFirst = index === 0;
                  return (
                    <tr
                      key={comment.id}
                      style={{
                        borderBottom: "1px solid #E0E3E6",
                      }}
                    >
                      {/* ID (rowSpan across all user comments) */}
                      {isFirst && (
                        <td
                          rowSpan={group.comments.length}
                          style={{
                            padding: "16px",
                            color: "#0D1017",
                            fontWeight: 500,
                            borderRight: "1px solid #E0E3E6",
                            verticalAlign: "middle",
                            textAlign: "center",
                          }}
                        >
                          {group.id}
                        </td>
                      )}

                      {/* Izoh egasi (rowSpan across all user comments) */}
                      {isFirst && (
                        <td
                          rowSpan={group.comments.length}
                          style={{
                            padding: "16px",
                            color: "#0D1017",
                            fontWeight: 500,
                            borderRight: "1px solid #E0E3E6",
                            verticalAlign: "middle",
                          }}
                        >
                          {group.authorName}
                        </td>
                      )}

                      {/* Comment text and rating bubble */}
                      <td style={{ padding: "16px", borderRight: "1px solid #E0E3E6" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                          <span style={{ color: "#0D1017", fontWeight: 400 }}>{comment.content}</span>
                          
                          {/* Dark gray rating speech bubble badge */}
                          <div style={{ position: "relative", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <div style={{
                              background: "#636C79",
                              borderRadius: "6px",
                              width: "22px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              fontSize: "11px",
                              fontWeight: 700,
                              position: "relative",
                            }}>
                              {comment.rating}
                              <div style={{
                                position: "absolute",
                                bottom: "-3px",
                                right: "3px",
                                width: "0",
                                height: "0",
                                borderStyle: "solid",
                                borderWidth: "4px 4px 0 0",
                                borderColor: "#636C79 transparent transparent transparent",
                              }} />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "16px", color: "#636C79", borderRight: "1px solid #E0E3E6" }}>
                        {comment.date || ""}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        {comment.hasActions ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <button
                              onClick={() => handleEditClick(group, comment)}
                              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#636C79", padding: "4px" }}
                              aria-label={t("common.edit")}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(comment.id)}
                              style={{ border: "none", background: "transparent", cursor: "pointer", color: "#EF4444", padding: "4px" }}
                              aria-label={t("common.delete")}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )
            )}
          </tbody>
        </table>

        {/* Bottom Pagination Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderTop: "1px solid #E0E3E6",
          background: "#ffffff",
          fontSize: "13px",
          color: "#636C79",
        }}>
          <span>
            {t("common.showingPage")} {rangeStart}-{rangeEnd} {t("common.of")} {filteredGroups.length}
          </span>
          <button
            onClick={handleExportXLS}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #E0E3E6",
              borderRadius: "6px",
              background: "#ffffff",
              padding: "6px 10px",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#0D1017",
            }}
          >
            <div style={{ position: "relative", width: "14px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/images/admin/Page.png"
                alt="excel"
                style={{ width: "100%", height: "auto" }}
              />
              <span style={{
                position: "absolute",
                bottom: "2px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "5px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1,
                letterSpacing: "-0.2px",
              }}>XLS</span>
            </div>
            <span>({filteredGroups.length}) {t("common.downloadXls")}</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <CommentModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        mode="edit"
        initialGroup={currentEditingGroup}
        initialComment={currentEditingComment}
        onSubmit={handleEditComment}
      />

      <DeleteModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <SuccessModal
        open={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        message={successMessage}
        type={successType}
      />
    </div>
  );
}
