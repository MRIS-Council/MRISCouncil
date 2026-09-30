"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type PhotoOfWeek = {
  id: string;
  image_url: string;
  caption: string;
  week_date: string;
  published: boolean;
};

const supabase = supabaseBrowser();

export default function MediaPanel() {
  const [photos, setPhotos] = useState<PhotoOfWeek[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [weekDate, setWeekDate] = useState("");
  const [published, setPublished] = useState(true);
  const [message, setMessage] = useState("");

  const loadPhotos = useCallback(async () => {
    const { data } = await supabase
      .from("photos_of_week")
      .select("*")
      .order("week_date", { ascending: false });

    setPhotos((data ?? []) as PhotoOfWeek[]);
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const addPhoto = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!imageUrl.trim()) {
      setMessage("Please enter an image URL.");
      return;
    }

    const { error } = await supabase.from("photos_of_week").insert({
      image_url: imageUrl,
      caption,
      week_date: new Date(weekDate).toISOString(),
      published,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setImageUrl("");
    setCaption("");
    setWeekDate("");
    setPublished(true);
    setMessage("Photo added successfully.");
    await loadPhotos();
  };

  const deletePhoto = async (id: string) => {
    await supabase.from("photos_of_week").delete().eq("id", id);
    await loadPhotos();
  };

  const togglePublish = async (id: string, currentState: boolean) => {
    await supabase.from("photos_of_week").update({ published: !currentState }).eq("id", id);
    await loadPhotos();
  };

  const fieldClass =
    "w-full px-3 py-2.5 rounded-xl border border-blue-100 dark:border-blue-900 bg-transparent text-blue-900 dark:text-blue-100";

  return (
    <section className="space-y-7">
      <div>
        <p className="text-xs font-bold tracking-[.24em] uppercase text-blue-600">Staff tools</p>
        <h2 className="text-2xl font-black uppercase text-blue-900 dark:text-blue-100">Media manager</h2>
        <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
          Upload a new Photo of the Week or manage the media gallery.
        </p>
      </div>

      <form onSubmit={addPhoto} className="card p-6 space-y-3">
        <h3 className="font-black uppercase text-blue-900 dark:text-blue-100 mb-4">Add Photo of the Week</h3>

        <label className="text-xs font-bold uppercase">
          Image URL
          <input
            required
            className={`${fieldClass} mt-1`}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </label>

        <label className="text-xs font-bold uppercase">
          Caption
          <input
            className={`${fieldClass} mt-1`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Brief description of the photo"
          />
        </label>

        <label className="text-xs font-bold uppercase">
          Week date
          <input
            required
            type="date"
            className={`${fieldClass} mt-1`}
            value={weekDate}
            onChange={(e) => setWeekDate(e.target.value)}
          />
        </label>

        <label className="text-xs font-bold uppercase">
          Publish
          <select
            className={`${fieldClass} mt-1`}
            value={published ? "true" : "false"}
            onChange={(e) => setPublished(e.target.value === "true")}
          >
            <option value="true">Yes</option>
            <option value="false">No (draft)</option>
          </select>
        </label>

        <button className="w-full bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-800">
          Add photo
        </button>
      </form>

      {photos.length > 0 && (
        <div className="card p-6">
          <h3 className="font-black uppercase text-blue-900 dark:text-blue-100 mb-4">All photos</h3>

          <div className="space-y-3">
            {photos.map((photo) => (
              <div key={photo.id} className="border-b border-blue-100 dark:border-blue-900 pb-4 flex flex-wrap justify-between gap-3">
                <div className="flex gap-3 flex-1">
                  <img
                    src={photo.image_url}
                    alt={photo.caption}
                    className="w-16 h-16 rounded-lg object-cover bg-blue-100 dark:bg-blue-900/30"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-blue-900 dark:text-blue-100">{photo.caption}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {new Date(photo.week_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <span className={`mt-1 inline-block text-xs font-bold px-2 py-1 rounded ${photo.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}`}>
                      {photo.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <button
                    type="button"
                    onClick={() => togglePublish(photo.id, photo.published)}
                    className="text-blue-600 font-bold text-xs"
                  >
                    {photo.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePhoto(photo.id)}
                    className="text-red-500 font-bold text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {message && <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{message}</p>}
    </section>
  );
}
