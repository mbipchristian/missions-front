"use client"

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { RefreshCw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Rang {
  id: number;
  nom: string;
  code: string;
  fraisInterne: number;
  fraisExterne: number;
  created_at: string;
  updated_at: string;
  actif: boolean;
}

interface RangDto {
  nom: string;
  code: string;
  fraisInterne: number;
  fraisExterne: number;
  actif: boolean;
}

export default function RangList() {
  const t = useTranslations("RangList");
  const { toast } = useToast();
  const [rangs, setRangs] = useState<Rang[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editRang, setEditRang] = useState<Rang | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Rang>>({});
  
  // États pour la création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<RangDto>({
    nom: '',
    code: '',
    fraisInterne: 0,
    fraisExterne: 0,
    actif: true
  });

  // États pour la suppression
  const [deleteRang, setDeleteRang] = useState<Rang | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchRangs();
  }, []);

  const fetchRangs = () => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:8080/auth/rangs/all")
      .then(res => {
        if (!res.ok) throw new Error(t("errors.fetchRangs"));
        return res.json();
      })
      .then(setRangs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const openEdit = (rang: Rang) => {
    setEditRang(rang);
    setEditForm({ ...rang });
    setEditError(null);
  };
  
  const closeEdit = () => {
    setEditRang(null);
    setEditForm({});
    setEditError(null);
  };
  
  const handleEditChange = (field: keyof Rang, value: any) => {
    setEditForm(f => ({ ...f, [field]: value }));
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRang) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const response = await fetch(`http://localhost:8080/auth/rangs/${editRang.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || t("errors.updateRang"));
      }
      closeEdit();
      fetchRangs();
      toast({
        title: t("success.title"),
        description: t("success.updateRang"),
      });
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Fonctions pour la suppression
  const openDelete = (rang: Rang) => {
    setDeleteRang(rang);
  };

  const closeDelete = () => {
    setDeleteRang(null);
  };

  const handleDelete = async () => {
    if (!deleteRang) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/auth/rangs/${deleteRang.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || t("errors.deleteRang"));
      }
      closeDelete();
      fetchRangs();
      toast({
        title: t("success.title"),
        description: t("success.deleteRang"),
      });
    } catch (e: any) {
      toast({
        title: t("errors.title"),
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Fonctions pour la création
  const openCreate = () => {
    setShowCreateModal(true);
    setCreateForm({
      nom: '',
      code: '',
      fraisInterne: 0,
      fraisExterne: 0,
      actif: true
    });
    setCreateError(null);
  };

  const closeCreate = () => {
    setShowCreateModal(false);
    setCreateForm({
      nom: '',
      code: '',
      fraisInterne: 0,
      fraisExterne: 0,
      actif: true
    });
    setCreateError(null);
  };

  const handleCreateChange = (field: keyof RangDto, value: any) => {
    setCreateForm(f => ({ ...f, [field]: value }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const response = await fetch("http://localhost:8080/auth/rangs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || t("errors.createRang"));
      }
      closeCreate();
      fetchRangs();
      toast({
        title: t("success.title"),
        description: t("success.createRang"),
      });
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t("buttons.newRang")}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="animate-spin w-8 h-8 text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : rangs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">{t("noRangsFound")}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.id")}</TableHead>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.code")}</TableHead>
                <TableHead>{t("table.internalFees")}</TableHead>
                <TableHead>{t("table.externalFees")}</TableHead>
                <TableHead>{t("table.createdAt")}</TableHead>
                <TableHead>{t("table.updatedAt")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rangs.map(rang => (
                <TableRow key={rang.id}>
                  <TableCell>{rang.id}</TableCell>
                  <TableCell>{rang.nom}</TableCell>
                  <TableCell>{rang.code}</TableCell>
                  <TableCell>{rang.fraisInterne}</TableCell>
                  <TableCell>{rang.fraisExterne}</TableCell>
                  <TableCell>{rang.created_at ? new Date(rang.created_at).toLocaleString() : ""}</TableCell>
                  <TableCell>{rang.updated_at ? new Date(rang.updated_at).toLocaleString() : ""}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(rang)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        {t("buttons.edit")}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openDelete(rang)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal de création */}
      <Dialog open={showCreateModal} onOpenChange={open => !open && closeCreate()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createModal.title")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label>{t("form.name")}</Label>
              <Input 
                value={createForm.nom} 
                onChange={e => handleCreateChange('nom', e.target.value)} 
                required 
                placeholder={t("form.namePlaceholder")}
              />
            </div>
            <div>
              <Label>{t("form.code")}</Label>
              <Input 
                value={createForm.code} 
                onChange={e => handleCreateChange('code', e.target.value)} 
                required 
                placeholder={t("form.codePlaceholder")}
              />
            </div>
            <div>
              <Label>{t("form.internalFees")}</Label>
              <Input 
                type="number" 
                value={createForm.fraisInterne} 
                onChange={e => handleCreateChange('fraisInterne', Number(e.target.value))} 
                required 
                min="0"
                step="1"
              />
            </div>
            <div>
              <Label>{t("form.externalFees")}</Label>
              <Input 
                type="number" 
                value={createForm.fraisExterne} 
                onChange={e => handleCreateChange('fraisExterne', Number(e.target.value))} 
                required 
                min="0"
                step="1"
              />
            </div>
        
            
            {createError && <div className="text-red-500 text-sm">{createError}</div>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={closeCreate}>
                {t("buttons.cancel")}
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? t("buttons.creating") : t("buttons.create")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog open={!!editRang} onOpenChange={open => !open && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editModal.title")}</DialogTitle>
          </DialogHeader>
          {editRang && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>{t("form.name")}</Label>
                <Input value={editForm.nom ?? ''} onChange={e => handleEditChange('nom', e.target.value)} required />
              </div>
              <div>
                <Label>{t("form.code")}</Label>
                <Input value={editForm.code ?? ''} onChange={e => handleEditChange('code', e.target.value)} required />
              </div>
              <div>
                <Label>{t("form.internalFees")}</Label>
                <Input type="number" value={editForm.fraisInterne ?? ''} onChange={e => handleEditChange('fraisInterne', Number(e.target.value))} required />
              </div>
              <div>
                <Label>{t("form.externalFees")}</Label>
                <Input type="number" value={editForm.fraisExterne ?? ''} onChange={e => handleEditChange('fraisExterne', Number(e.target.value))} required />
              </div>
              
              {editError && <div className="text-red-500 text-sm">{editError}</div>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={closeEdit}>{t("buttons.cancel")}</Button>
                <Button type="submit" disabled={editLoading}>{editLoading ? t("buttons.saving") : t("buttons.save")}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <AlertDialog open={!!deleteRang} onOpenChange={open => !open && closeDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteModal.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteModal.description", { name: deleteRang?.nom })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDelete}>{t("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? t("buttons.deleting") : t("buttons.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </Card>
  );
}