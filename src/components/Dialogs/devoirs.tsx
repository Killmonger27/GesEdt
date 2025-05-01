import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Module } from "../../interfaces/Module";
import { Salle } from "../../interfaces/Salle";
import { Devoir } from "../../interfaces/EDT";

const DevoirDialog = (
  selectedDevoir: Devoir | null,
  setIsDevoirDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  isSubmitting: boolean,
  formError: string | null,
  formFieldErrors: Record<string, string>,
  selectedDate: Date | null,
  handleDevoirSubmit: (e: React.FormEvent) => void,
  matieres: Module[],
  salles: Salle[],
  isDevoirDialogOpen: boolean
) => {
  return (
    <Dialog open={isDevoirDialogOpen} onOpenChange={setIsDevoirDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedDevoir ? "Modifier un devoir" : "Ajouter un devoir"}
          </DialogTitle>
          <DialogDescription>
            {selectedDevoir
              ? "Modifiez les détails du devoir sélectionné."
              : "Remplissez le formulaire pour ajouter un nouveau devoir à l'emploi du temps."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDevoirSubmit}>
          {formError && (
            <div className="bg-red-50 text-red-900 p-3 rounded-md mb-4">
              {formError}
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                name="date"
                defaultValue={
                  selectedDevoir
                    ? new Date(selectedDevoir.date).toISOString().split("T")[0]
                    : selectedDate
                    ? new Date(selectedDate).toISOString().split("T")[0]
                    : ""
                }
                required
              />
              {formFieldErrors.date && (
                <p className="text-red-500 text-sm">{formFieldErrors.date}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="creneau">Créneau</Label>
              <Select
                name="creneau"
                defaultValue={selectedDevoir?.crenau || "MATIN"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un créneau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATIN">Matin</SelectItem>
                  <SelectItem value="SOIR">Soir</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.creneau && (
                <p className="text-red-500 text-sm">
                  {formFieldErrors.creneau}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="idMatiere">Matière</Label>
              <Select
                name="idMatiere"
                defaultValue={selectedDevoir?.idMatiere || ""}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une matière" />
                </SelectTrigger>
                <SelectContent>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id}>
                      {matiere.intitule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formFieldErrors.idMatiere && (
                <p className="text-red-500 text-sm">
                  {formFieldErrors.idMatiere}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="idSalle">Salle</Label>
              <Select
                name="idSalle"
                defaultValue={selectedDevoir?.idSalle || ""}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une salle" />
                </SelectTrigger>
                <SelectContent>
                  {salles.map((salle) => (
                    <SelectItem key={salle.id} value={salle.id}>
                      {salle.numeroSalle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formFieldErrors.idSalle && (
                <p className="text-red-500 text-sm">
                  {formFieldErrors.idSalle}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="statutDevoir">Statut du devoir</Label>
              <Select
                name="statutDevoir"
                defaultValue={selectedDevoir?.statutDevoir || "A_FAIRE"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NON_FAIT">À faire</SelectItem>
                  <SelectItem value="FAIT">Fait</SelectItem>
                  <SelectItem value="ANNULE">Annulé</SelectItem>
                </SelectContent>
              </Select>
              {formFieldErrors.statutDevoir && (
                <p className="text-red-500 text-sm">
                  {formFieldErrors.statutDevoir}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDevoirDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : selectedDevoir ? (
                "Mettre à jour"
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DevoirDialog;
