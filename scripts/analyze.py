#!/usr/bin/env python3
"""Audio analysis for strudel-mcp. Outputs JSON to stdout, spectrogram to file."""

import sys
import json
import os
import numpy as np

def analyze(audio_path, spectrogram_path=None):
    import librosa
    import librosa.display

    y, sr = librosa.load(audio_path, sr=22050, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)

    # BPM
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    bpm = float(np.atleast_1d(tempo)[0])
    beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()

    # Key detection via Krumhansl-Schmuckler
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_avg = np.mean(chroma, axis=1)
    key_name, key_mode, key_confidence = detect_key(chroma_avg)

    # Chord estimation via chroma segments
    chords = estimate_chords(y, sr, beat_frames)

    # Onset strength for rhythm analysis
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr).tolist()

    # Spectrogram
    if spectrogram_path:
        generate_spectrogram(y, sr, spectrogram_path, duration, bpm, key_name, key_mode)

    result = {
        "file": os.path.basename(audio_path),
        "duration_seconds": round(duration, 2),
        "bpm": round(bpm, 1),
        "key": key_name,
        "mode": key_mode,
        "key_confidence": round(key_confidence, 3),
        "beats": {
            "count": len(beat_times),
            "times": [round(t, 3) for t in beat_times[:64]],
        },
        "chords": chords[:32],
        "onsets": {
            "count": len(onset_times),
            "density_per_second": round(len(onset_times) / max(duration, 0.1), 1),
        },
        "spectrogram": spectrogram_path if spectrogram_path else None,
    }

    return result


NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

# Krumhansl-Schmuckler key profiles
MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


def detect_key(chroma_avg):
    best_corr = -2
    best_key = 0
    best_mode = 'major'

    for shift in range(12):
        rolled = np.roll(chroma_avg, -shift)
        corr_major = float(np.corrcoef(rolled, MAJOR_PROFILE)[0, 1])
        corr_minor = float(np.corrcoef(rolled, MINOR_PROFILE)[0, 1])

        if corr_major > best_corr:
            best_corr = corr_major
            best_key = shift
            best_mode = 'major'
        if corr_minor > best_corr:
            best_corr = corr_minor
            best_key = shift
            best_mode = 'minor'

    return NOTE_NAMES[best_key], best_mode, best_corr


CHORD_TEMPLATES = {}
for i, root in enumerate(NOTE_NAMES):
    # Major triad
    t = np.zeros(12)
    t[i] = 1; t[(i+4)%12] = 1; t[(i+7)%12] = 1
    CHORD_TEMPLATES[root] = t
    # Minor triad
    t = np.zeros(12)
    t[i] = 1; t[(i+3)%12] = 1; t[(i+7)%12] = 1
    CHORD_TEMPLATES[root + 'm'] = t


def estimate_chords(y, sr, beat_frames):
    import librosa
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

    if len(beat_frames) < 2:
        return []

    chords = []
    for i in range(len(beat_frames) - 1):
        start = beat_frames[i]
        end = beat_frames[i + 1]
        if end <= start:
            continue
        segment = np.mean(chroma[:, start:end], axis=1)
        if np.sum(segment) < 0.01:
            chords.append({"time": round(float(librosa.frames_to_time(start, sr=sr)), 3), "chord": "N"})
            continue

        best_chord = "N"
        best_score = -1
        for name, template in CHORD_TEMPLATES.items():
            score = float(np.dot(segment, template) / (np.linalg.norm(segment) * np.linalg.norm(template) + 1e-8))
            if score > best_score:
                best_score = score
                best_chord = name

        beat_time = float(librosa.frames_to_time(start, sr=sr))
        chords.append({"time": round(beat_time, 3), "chord": best_chord, "confidence": round(best_score, 3)})

    # Simplify: merge consecutive identical chords
    merged = []
    for c in chords:
        if merged and merged[-1]["chord"] == c["chord"]:
            continue
        merged.append(c)

    return merged


def generate_spectrogram(y, sr, output_path, duration, bpm, key, mode):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import librosa.display

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fig, axes = plt.subplots(3, 1, figsize=(16, 10), facecolor='#0a0a0a')
    fig.suptitle(f'Audio Analysis — {bpm:.0f} BPM, {key} {mode}', color='white', fontsize=14, fontweight='bold')

    # Mel spectrogram
    S = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128, fmax=8000)
    S_dB = librosa.power_to_db(S, ref=np.max)
    ax1 = axes[0]
    ax1.set_facecolor('#0a0a0a')
    librosa.display.specshow(S_dB, sr=sr, x_axis='time', y_axis='mel', ax=ax1, cmap='magma')
    ax1.set_title('Mel Spectrogram', color='white', fontsize=11)
    ax1.tick_params(colors='white')
    ax1.xaxis.label.set_color('white')
    ax1.yaxis.label.set_color('white')

    # Chromagram
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    ax2 = axes[1]
    ax2.set_facecolor('#0a0a0a')
    librosa.display.specshow(chroma, sr=sr, x_axis='time', y_axis='chroma', ax=ax2, cmap='coolwarm')
    ax2.set_title('Chromagram (pitch classes over time)', color='white', fontsize=11)
    ax2.tick_params(colors='white')
    ax2.xaxis.label.set_color('white')
    ax2.yaxis.label.set_color('white')

    # Onset strength + beats
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    times = librosa.times_like(onset_env, sr=sr)
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beats, sr=sr)
    ax3 = axes[2]
    ax3.set_facecolor('#0a0a0a')
    ax3.plot(times, onset_env, color='#ff6b6b', linewidth=0.5, alpha=0.8)
    ax3.vlines(beat_times, 0, onset_env.max(), color='#4ecdc4', alpha=0.6, linewidth=0.8, label='Beats')
    ax3.set_title('Onset Strength + Beat Grid', color='white', fontsize=11)
    ax3.set_xlabel('Time (s)', color='white')
    ax3.tick_params(colors='white')
    ax3.legend(facecolor='#1a1a1a', edgecolor='#333', labelcolor='white')
    ax3.set_xlim(0, min(duration, times[-1]))

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='#0a0a0a')
    plt.close()


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: analyze.py <audio_file> [spectrogram_output.png]"}))
        sys.exit(1)

    audio_file = sys.argv[1]
    spec_file = sys.argv[2] if len(sys.argv) > 2 else None

    if not os.path.exists(audio_file):
        print(json.dumps({"error": f"File not found: {audio_file}"}))
        sys.exit(1)

    result = analyze(audio_file, spec_file)
    print(json.dumps(result, indent=2))
