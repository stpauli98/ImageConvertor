'use client';

import { ConversionSettings } from '@/types';
import { estimateSavings } from '@/utils/imageUtils';
import { formatBytes } from '@/utils/formatBytes';

interface ControlPanelProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: Partial<ConversionSettings>) => void;
  totalOriginalSize: number;
  hasImages: boolean;
}

export function ControlPanel({
  settings,
  onSettingsChange,
  totalOriginalSize,
  hasImages,
}: ControlPanelProps) {
  const estimatedSavings = totalOriginalSize > 0
    ? estimateSavings(totalOriginalSize, settings.quality)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Postavke konverzije
      </h2>

      {/* Quality Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="quality"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Kvaliteta kompresije
          </label>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {settings.quality}%
          </span>
        </div>

        <input
          type="range"
          id="quality"
          min="1"
          max="100"
          value={settings.quality}
          onChange={(e) => onSettingsChange({ quality: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
          <span>Manja veličina</span>
          <span>Veća kvaliteta</span>
        </div>

        {hasImages && estimatedSavings > 0 && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
            <p className="text-sm text-green-700 dark:text-green-400">
              <span className="font-medium">Procijenjena ušteda:</span>{' '}
              ~{formatBytes(estimatedSavings)}
            </p>
          </div>
        )}
      </div>

      {/* Resize Options */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="enableResize"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Promijeni veličinu
          </label>
          <button
            id="enableResize"
            role="switch"
            aria-checked={settings.enableResize}
            onClick={() => onSettingsChange({ enableResize: !settings.enableResize })}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              ${settings.enableResize ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                ${settings.enableResize ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {settings.enableResize && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="maxWidth"
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  Max širina (px)
                </label>
                <input
                  type="number"
                  id="maxWidth"
                  min="1"
                  max="10000"
                  value={settings.maxWidth}
                  onChange={(e) => onSettingsChange({ maxWidth: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="maxHeight"
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  Max visina (px)
                </label>
                <input
                  type="number"
                  id="maxHeight"
                  min="1"
                  max="10000"
                  value={settings.maxHeight}
                  onChange={(e) => onSettingsChange({ maxHeight: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Aspect ratio će biti automatski očuvan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
