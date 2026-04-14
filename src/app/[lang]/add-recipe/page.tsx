'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createRecipe } from '@/app/[lang]/actions/recipe';
import BackButton from '@/app/[lang]/components/BackButton';
import { useLang } from '@/app/[lang]/components/LangContext';

export default function CreateRecipe() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { lang, dict: t } = useLang();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cookingTime, setCookingTime] = useState('45');
  const [difficulty, setDifficulty] = useState(t.addRecipe.difficultyMedium);
  const [servings] = useState('2');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState(['']);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: '' }]);
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!name || ingredients.some(i => !i.name) || steps.some(s => !s)) {
      alert(t.addRecipe.validationError);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('cookingTime', cookingTime);
    formData.append('difficulty', difficulty);
    formData.append('servings', servings);
    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append('steps', JSON.stringify(steps));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const result = await createRecipe(formData);
    setLoading(false);

    if (result.success) {
      router.push(`/${lang}/my-recipes`);
    } else {
      alert(t.addRecipe.errorPrefix + result.error);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <main className="bg-surface text-on-surface pb-32 max-w-2xl mx-auto min-h-screen selection:bg-secondary-container">
      {/* Top Navigation */}
      <header className="flex justify-between items-center w-full px-6 py-4 bg-surface/80 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref={`/${lang}/my-recipes`} forceFallback={true} />
          <h1 className="font-headline font-bold text-xl tracking-tight text-primary">{t.addRecipe.pageTitle}</h1>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-colors">
            <span className="material-symbols-outlined text-primary">more_vert</span>
          </button>
        </div>
      </header>

      <div className="px-6 py-8 space-y-10 animate-fade-in">
        {/* Section 1: Image & General Info */}
        <section className="space-y-8">
          <div
            className="relative group aspect-[4/3] w-full bg-surface-container-low rounded-lg overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer shadow-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <Image src={imagePreview} fill className="object-cover transition-transform group-hover:scale-105" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">edit</span>
                    <span className="text-xs font-black uppercase text-primary">{t.addRecipe.changeImage}</span>
                  </div>
                </div>
                <button
                  onClick={removeImage}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-error hover:bg-error-container transition-colors z-20"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </>
            ) : (
              <div className="z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
                </div>
                <p className="font-headline font-bold text-primary">{t.addRecipe.addPhoto}</p>
                <p className="text-sm text-on-surface-variant/70">{t.addRecipe.suggestedSize}</p>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant px-1">{t.addRecipe.recipeName}</label>
              <input
                className="w-full px-6 py-4 rounded-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary outline-none font-headline font-semibold text-lg transition-all"
                placeholder={t.addRecipe.recipeNamePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant px-1">{t.addRecipe.description}</label>
              <textarea
                className="w-full px-6 py-4 rounded-lg bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary outline-none font-body text-base transition-all resize-none"
                placeholder={t.addRecipe.descriptionPlaceholder}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Cooking Params */}
        <section className="bg-surface-container-low rounded-lg p-6 space-y-6 border border-outline-variant/10">
          <h2 className="font-headline font-extrabold text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">speed</span>
            {t.addRecipe.cookingParams}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant px-1">{t.addRecipe.cookingTime}</label>
              <div className="relative">
                <input
                  className="w-full pl-6 pr-12 py-3.5 rounded-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary outline-none font-body"
                  placeholder={t.addRecipe.cookingTimePlaceholder}
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 pointer-events-none">schedule</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant px-1">{t.addRecipe.difficulty}</label>
              <select
                className="w-full px-6 py-3.5 rounded-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary outline-none font-body appearance-none"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option>{t.addRecipe.difficultyEasy}</option>
                <option>{t.addRecipe.difficultyMedium}</option>
                <option>{t.addRecipe.difficultyHard}</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 3: Ingredients */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-extrabold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">shopping_basket</span>
              {t.addRecipe.ingredientsList}
            </h2>
            <span className="text-xs font-bold text-on-surface-variant/60 uppercase">{ingredients.length} {t.common.ingredients}</span>
          </div>
          <div className="space-y-3">
            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 items-center animate-fade-in group">
                <input
                  className="flex-grow px-5 py-3 rounded-full bg-surface-container-low border-none ring-1 ring-outline-variant/10 focus:ring-2 focus:ring-secondary outline-none font-body text-sm"
                  placeholder={t.addRecipe.ingredientName}
                  value={ing.name}
                  onChange={(e) => {
                    const newIngs = [...ingredients];
                    newIngs[index].name = e.target.value;
                    setIngredients(newIngs);
                  }}
                />
                <input
                  className="w-24 px-5 py-3 rounded-full bg-surface-container-low border-none ring-1 ring-outline-variant/10 focus:ring-2 focus:ring-secondary outline-none font-body text-sm text-center"
                  placeholder={t.addRecipe.ingredientAmount}
                  value={ing.amount}
                  onChange={(e) => {
                    const newIngs = [...ingredients];
                    newIngs[index].amount = e.target.value;
                    setIngredients(newIngs);
                  }}
                />
                <button
                  className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-error transition-colors disabled:opacity-0"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
          <button
            className="w-full py-4 rounded-full border-2 border-dashed border-secondary/30 text-secondary font-headline font-bold flex items-center justify-center gap-2 hover:bg-secondary/5 transition-all"
            onClick={addIngredient}
          >
            <span className="material-symbols-outlined">add_circle</span>
            {t.addRecipe.addIngredient}
          </button>
        </section>

        {/* Section 4: Steps */}
        <section className="space-y-6">
          <h2 className="font-headline font-extrabold text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">format_list_numbered</span>
            {t.addRecipe.stepsTitle}
          </h2>
          <div className="space-y-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative pl-12 group animate-fade-in">
                <div className="absolute left-0 top-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-on-primary font-headline font-black text-xs shadow-md">
                  {index + 1}
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <textarea
                      className="w-full px-6 py-4 rounded-lg bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary outline-none font-body text-base"
                      placeholder={index === 0 ? t.addRecipe.stepPlaceholderFirst : t.addRecipe.stepPlaceholderNext}
                      rows={2}
                      value={step}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index] = e.target.value;
                        setSteps(newSteps);
                      }}
                    />
                    <button
                      className="text-on-surface-variant/40 hover:text-error transition-colors self-start mt-2 disabled:opacity-0"
                      onClick={() => removeStep(index)}
                      disabled={steps.length === 1}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="w-full py-4 rounded-full border-2 border-dashed border-primary/30 text-primary font-headline font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
            onClick={addStep}
          >
            <span className="material-symbols-outlined">add_task</span>
            {t.addRecipe.addStep}
          </button>
        </section>
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-surface/80 backdrop-blur-xl z-50 border-t border-outline-variant/10">
        <button
          className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? t.addRecipe.saving : t.addRecipe.saveRecipe}
        </button>
      </div>
    </main>
  );
}
