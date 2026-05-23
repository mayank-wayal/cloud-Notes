"use client";

import { motion } from "framer-motion";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { fadeUp, staggerContainer } from "@/components/layout/motion-shell";
import { useToast } from "@/components/providers/toast-provider";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { useNotes } from "@/hooks/use-notes";
import { getApiError } from "@/services/api";

export function UploadPageClient() {
  const { upload } = useNotes();
  const { toast } = useToast();

  const handleUpload = async (input: { title: string; file: File; onProgress?: (progress: number) => void }) => {
    try {
      await upload(input);
      toast({ type: "success", title: "Upload complete", description: "Your file is now in CloudNotes." });
    } catch (error) {
      toast({ type: "error", title: "Upload failed", description: getApiError(error) });
      throw error;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.section variants={fadeUp} className="mb-6">
            <p className="text-sm font-medium text-slate-500">Upload</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Add files to your workspace</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A focused drag-and-drop flow with progress, preview, and clear success/error feedback.</p>
          </motion.section>
          <motion.section variants={fadeUp}>
            <Card>
              <CardContent>
                <UploadDropzone onUpload={handleUpload} />
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
