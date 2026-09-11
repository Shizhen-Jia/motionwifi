import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {FileBlob, Presentation, PresentationFile} from '@oai/artifact-tool';

const workspaceDir='E:/CL_Project/motionwifi';
const SKILL_DIR='C:/Users/jsz69/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations';
const tmp=path.join(workspaceDir,'tmp/slides_build');
const sourceTemplatePath=path.join(workspaceDir,'Adaptive Multi-Client Antenna Orientation Optimization for APs.pptx');
const RUNTIME_PYTHON='C:/Users/jsz69/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
process.env.RUNTIME_NODE_MODULES='C:/Users/jsz69/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
process.env.RUNTIME_PYTHON=RUNTIME_PYTHON;
const {makeNativeBulletParagraphs,finalizePresentation}=await import(pathToFileURL(path.join(SKILL_DIR,'container_tools/artifact_tool_utils.mjs')));
const fontPolicy={basis:'reference',families:['Aptos','Aptos Display'],referencePath:sourceTemplatePath,referenceSha256:crypto.createHash('sha256').update(await fs.readFile(sourceTemplatePath)).digest('hex')};

const content=[
 {title:'I. Measurement model',items:[
  ['Synthetic array: ', 'Sample complex CSI while one antenna rotates. Pattern changes and phase-center motion both encode arrival direction.'],
  ['One axis: ', 'Tilt β from 0° to 180° in 5° steps (37 positions). Use an in-plane path model.'],
  ['Two axes: ', 'Pan γ and tilt α cover the upper hemisphere. Here α is the polar angle measured from +z.'],
  ['Shared model: ', 'x = A c + w, with aₖ(ξ) = gₖ(ξ) exp[j(2π/λ) pₖᵀu(ξ)]. Estimate path direction ξ from calibrated amplitude and phase.']
 ],notes:'Source: AoA_Estimation_Rotating_WiFi_Antenna_MUSIC_ESPRIT_SAGE.md, §§1.1–1.4.1 and 2.1.1–2.1.2. The synthetic elements are sequential samples, not simultaneous RF channels. c is the complex path-gain vector, A contains steering vectors, g is the calibrated complex element response, p is phase-center position, and u is the arrival unit vector. The 1-D approximation assumes paths lie in the scan plane. As clarified in Part II, arbitrary out-of-plane paths cannot in general be replaced exactly by their projected angles. In 2-D, α is polar angle from +z (0–90°) and γ is azimuth (0–360°), despite the earlier elevation terminology. The dipole axis is not its direction of maximum radiation.'},
 {title:'I. MUSIC and ESPRIT',items:[
  ['MUSIC: ', 'Estimate covariance, separate signal and noise subspaces, then search for arrival directions with little noise-subspace energy.'],
  ['MUSIC requirements: ', 'Use enough valid snapshots and calibrated steering vectors. Coherent multipath needs suitable decorrelation or smoothing.'],
  ['ESPRIT: ', 'Infer angles from shift invariance after a calibrated beamspace transform. It avoids a spectral grid search.'],
  ['ESPRIT limitation: ', 'A rotating arc has no direct shift invariance. Validate the transform for the actual aperture, sampling and antenna pattern.']
 ],notes:'Source: MD §§1.3.2–1.3.4, 1.4.4 and 1.6. MUSIC pseudo-spectrum: P(ξ)=1/[a(ξ)^H U_n U_n^H a(ξ)]. Its peaks estimate path directions; peak heights are not calibrated path powers. Covariance estimates require sufficient signal rank. OFDM frequency snapshots require per-frequency manifolds or valid wideband focusing, rather than blindly combining different steering vectors. For ESPRIT, solve J1 Es Ψ≈J2 Es after an appropriate transform and obtain directions from eigenvalues. The source proposes a phase-mode transform as an approximation. A partial 180° arc and real element pattern require explicit verification of this approximation; the full-circle UCA result must not be assumed exact. In 2-D, a suitable mode transform is substantially more complex. This slide makes no accuracy or complexity performance claim.'},
 {title:'I. SAGE path fitting',items:[
  ['Initialize: ', 'Use beamformer or MUSIC peaks to seed path angles and complex gains.'],
  ['Isolate one path: ', 'Form its residual observation by subtracting every other fitted path from the measured channel.'],
  ['Update and repeat: ', 'Search the angle that best matches this residual, update its complex gain, and cycle through the paths until convergence.'],
  ['Use and limits: ', 'SAGE directly fits the calibrated manifold and coherent multipath. Few snapshots may suffice, but identifiability, initialization and model accuracy still matter.']
 ],notes:'Source: MD §§1.3.5, 1.4.4, 1.6 and 2.1.5. SAGE stands for Space-Alternating Generalized Expectation-maximization. The direction update maximizes |a(ξ)^H y_d|²/||a(ξ)||²; the complex-gain update is c_d=a(ξ_d)^H y_d/||a(ξ_d)||². The 2-D version searches over an arrival-direction pair rather than one in-plane angle. OFDM measurements can extend the path model with delay, and sufficiently informative temporal measurements can extend it with Doppler. Coherent multipath is represented explicitly, but successful separation still depends on the manifold and data. SAGE is iterative and can converge to a local solution. Compare model order, residuals and held-out prediction reliability. Magnitude-only operation requires a different likelihood and has greater ambiguity; it cannot simply reuse coherent complex-data formulas.'},
 {title:'I. Measurement requirements',items:[
  ['Phase reference: ', 'Maintain coherence across positions using a stable reference or validated phase correction. Calibrate gain changes and timing offsets.'],
  ['Sweep duration: ', 'Complete the coherent measurement set while the channel remains sufficiently stable. Include motor travel and settling time.'],
  ['Antenna calibration: ', 'Measure the complex pattern and phase-center offset. Account for polarization and the AP chassis.'],
  ['Fallback: ', 'Use amplitude-only fitting when phase is unreliable. Use direct performance probes when a static channel fit is unreliable.']
 ],notes:'Source: MD §§1.2.3, 1.5, 2.1.1 and 3.1.2. A fixed reference antenna must have a stable nonzero response. A CSI ratio alone does not provide absolute received power, and its frequency response must be accounted for if delays are estimated. Spatial smoothing is geometry-dependent and is not a generic fix for every synthetic manifold. A coherent model requires channel and phase stability across combined observations. A direct rate comparison needs only a stable enough performance distribution over the comparison window, which is a weaker condition. No universal scan duration or accuracy is asserted.'},
 {title:'II. Channel and goodput',items:[
  ['Per-client reconstruction: ', 'MUSIC needs a subsequent gain/delay fit. SAGE estimates path parameters jointly. Reconstruct each client channel at candidate orientation q.'],
  ['Coherent combination: ', 'For each client and subcarrier, add complex path responses before taking power: h(q) = Σ c(d) a(q;ξ(d)), then |h(q)|². Include path delay across subcarriers.'],
  ['Delivered traffic: ', 'Tᵢ(q) = min{ℓᵢ, aᵢ Cᵢ(q)}, with Σᵢ aᵢ ≤ 1. Account for offered load, shared airtime, retries and overhead.'],
  ['Orientation response: ', 'Dipole gain is strongest broadside to the axis. Multipath and interference can move the best operating orientation away from a dominant AoA.']
 ],notes:'Source: MD §§2.1.1–2.1.5. n indexes subcarriers; c is complex path gain at reference frequency f0, ξ is arrival direction and τ is path delay. C_i(q) is payload rate per second of airtime allocated to client i, a_i is its airtime share, and ℓ_i is offered load in bit/s. Goodput counts successfully delivered non-duplicate payload, excluding retransmitted copies and protocol overhead. The analytical SINR-to-rate surrogate in the document needs device calibration and does not replace measured Wi-Fi goodput. The baseline uses one common orientation, with associated clients normally taking separate transmission opportunities. Interference refers to external or overlapping transmissions. The baseline optimizes uplink reception; downlink requires its own link validation. Several reflections of a client remain one client channel.'},
 {title:'II. Three service objectives',items:[
  ['One source: ', 'Maximize that source’s measured goodput or a declared SINR objective over feasible orientations.'],
  ['Multiple sources: ', 'Maximize J(q) = Σᵢ Tᵢ(q), using the same airtime policy. Add minimum rates when connectivity or fairness requires them.'],
  ['Prioritized services: ', 'Maximize weighted service goodput, or use a concave utility for diminishing returns. Services on one client share its channel and airtime.'],
  ['Service constraints: ', 'Weights express preference. Critical services also need explicit rate requirements and measured delay or deadline checks.']
 ],notes:'Source: MD §§2.2.2–2.2.4 and 2.3.2–2.3.4. The same three objectives apply in 1-D and 2-D. q denotes one common antenna orientation per data interval, not an independently steerable beam per client or service. For service f, T_f=min{ℓ_f,a_f C_i(f)} with Σ_f a_f≤1. r_f in the logarithm is a fixed positive reference rate in bit/s, so the logarithm is dimensionless. Concave utility reduces the incentive to allocate gains only to already-fast services but does not guarantee feasibility. Policy supplies service labels, weights and requirements. Neither AoA nor frequent use defines service priority. Throughput alone cannot guarantee latency. If no tested orientation is feasible, report the unmet requirements and use a configured scheduling/admission fallback. Proposed objectives, not validated QoS guarantees.'},
 {title:'II. Search and verification',items:[
  ['Candidate space: ', 'Search tilt q = β in 1-D or pan–tilt q = (γ, α) in 2-D. Include the current orientation and feasible actuator limits.'],
  ['Prediction: ', 'Score calibrated channel models on a coarse grid, retain several separated candidates, and refine locally where useful.'],
  ['Physical verification: ', 'Probe finalists and the current orientation under the same traffic, priorities and access policy. Reject invalid or infeasible comparisons.'],
  ['Commit and hold: ', 'Move only after a meaningful verified gain, or to restore a critical service. Charge scanning, motion and settling against delivered service.']
 ],notes:'Source: MD §§2.1.6, 2.2.1, 2.3.1 and 2.4. The baseline 1-D scan uses 37 states at 5° spacing. A 2-D grid should avoid redundant azimuth sampling near the pole and respect movement limits and calibrated spatial sampling. Grid scoring identifies the best predicted orientation only on the evaluated grid; a shortlist of real probes does not prove the continuous physical optimum. If reconstruction is unreliable, use direct performance probing on the same objective. The current orientation must remain a candidate. Paired/interleaved measurements reduce confounding by time drift. Weights, demand and airtime policy should remain fixed within one comparison. A simple interrupted-service epoch factor is ζ=max(0,1−T_overhead/T_epoch), but actual evaluation must count any useful traffic carried during motion or scanning. Optimization occurs over adaptation epochs, not per packet.'},
 {title:'III. Adaptation policies',items:[
  ['A. Periodic full scan: ', 'Rescan the feasible grid on a fixed schedule, verify the winner, then hold. Simple baseline with recurring overhead and delayed response.'],
  ['B. Event-triggered search: ', 'React to sustained degradation with bounded local probes. Keep independent global checks and escalate when local recovery fails.'],
  ['C. Predictive adaptation: ', 'Learn recurring activity and demand, then rank probes or propose advance moves. Retain Scheme B’s live feedback and recovery.'],
  ['Common basis: ', 'Use the same hardware, feasible orientations, service objectives and verification rules. Benefits require experimental validation.']
 ],notes:'Source: MD §§3.1, 3.2, 3.3, 3.5.1 and 3.6.1. Scheme A periodically scans the configured grid, not necessarily every mathematically possible orientation. Scheme B is a plausible starting hypothesis when motion is expensive and conditions change slowly, but the document does not establish that it always outperforms Scheme A. A distant optimum can improve while the current orientation does not degrade, which requires independent global exploration. Scheme C is a predictive controller extension, not another AoA estimator. All three controller designs are proposals rather than measured performance results.'},
 {title:'III. Event-triggered control',items:[
  ['Monitor: ', 'Track per-service performance and sustained degradation. Distinguish channel changes from low demand, contention and policy changes.'],
  ['Search: ', 'Probe nearby tilt or pan–tilt states within a time budget. Periodically test distant states even when current performance is stable.'],
  ['Verify: ', 'Bracket each candidate with current-orientation probes. Accept when gain minus uncertainty exceeds the switch margin and service constraints pass.'],
  ['Recover: ', 'Confirm a committed move, roll back to a freshly checked backup if needed, and widen the search when local recovery fails.']
 ],notes:'Source: MD §§3.1.2–3.1.3 and 3.3. The bracket sequence is incumbent, candidate, incumbent. With equally spaced centers, Δ_r=y_r(q_c)−[y_before(q_0)+y_after(q_0)]/2. Δ̄ is the average improvement across valid blocks, uΔ is a calibrated uncertainty allowance and δ_switch is a practical gain margin. Calibrate uncertainty by comparison blocks rather than treating correlated packets as independent samples. Reject brackets with excessive incumbent drift, missing required client data or changed policy context. A feasibility-restoration rule can choose a candidate that repairs a critical service even if sum utility decreases. Local steps, global coverage, model refresh, minimum dwell and a rolling exploration budget jointly control mechanical cost. Stale backups must be revalidated. Persistent deterioration may require a new attainable baseline with an explicit unmet-service status.'},
 {title:'III. Learning recurring demand',items:[
  ['Observations: ', 'Record time of day, weekday/weekend, active devices, service demand and spatial context together with actual outcomes.'],
  ['Initial model: ', 'Learn recency-weighted seasonal profiles. Pool sparse contexts and express uncertainty in activity, demand and co-occurrence.'],
  ['Separate predictions: ', 'Forecast who may need service, then estimate current orientation performance from fresh models or probes. Policy supplies priority weights.'],
  ['Cold start and change: ', 'Run Scheme B while collecting history. Reduce predictive confidence when routines shift, forecasts fail or a context is unfamiliar.']
 ],notes:'Source: MD §§3.6.2–3.7.5. Seasonal profiles estimate conditional activity probabilities, demand quantiles, spatial-state distributions and observed joint activity. The proposed probability estimator combines recency-weighted context observations with κ times a broader pooled profile, then divides by total observation weight plus κ. Estimate uncertainty by independent sessions or days, not every packet. Missing labels are not negative events. Weekly patterns need repeated independent weekly occurrences. A recurring room context supplies candidate regions, not a guaranteed current orientation. Do not coherently average CSI from different days. A camera or other IoT device may have substantial or critical demand; the device category alone should not determine its weight. Preserve independent exploration to limit bias from repeatedly visiting only preferred orientations.'},
 {title:'III. Predictive decisions',items:[
  ['Candidate planning: ', 'Combine likely demand scenarios with fresh channel evidence. Include holding, previous verified candidates and multi-client compromises.'],
  ['Horizon value: ', 'Score expected service utility over a short horizon after probe and movement costs. Require the predicted gain to exceed uncertainty and a switch margin.'],
  ['Current-service guard: ', 'Revalidate candidate performance before an advance move. Protect active critical services and let urgent live recovery override forecasts.'],
  ['Incremental use: ', 'Begin with prediction-based probe ranking. Add proactive movement only after forecasts and response models validate well.']
 ],notes:'Source: MD §§3.8.1–3.8.5 and 3.9.1. The proposed score is V(q)=Σ_h Δt_h Σ_s p_s Σ_f w_f,h^(s) U_f(T_f,h^(s)(q))−C_mechanical(q_c,q). T includes available airtime after probing and movement, so the same service loss must not be subtracted twice. For nonlinear utility, evaluate each joint scenario before averaging. Mechanical penalties must use compatible units, or movement can instead be controlled entirely by budgets. The forecast acceptance gate is V(q)−V(q_c)−uV(q)>δ_predict. A proactive move can temporarily reduce the present objective, so it needs a separate short-horizon forecast gate plus present-service guards; requiring a positive current-rate improvement would eliminate useful anticipation. One actuator controller arbitrates all requests. Share the exploration budget across predictive, local and global probes, and retain independent global coverage. Replan frequently rather than enforcing a rigid daily schedule.'},
 {title:'III. Evaluation and rollout',items:[
  ['Fair comparison: ', 'Compare A, B and C on equal elapsed time and matched movement or exploration budgets. Include static, drifting and abruptly changing environments.'],
  ['Service outcome: ', 'Report wall-clock goodput = delivered payload bits / elapsed time, plus per-service delay, violations and recovery time.'],
  ['Search and learning: ', 'Track probe cost, travel, false triggers and distant-optimum discovery. Evaluate forecasts chronologically, including cold start and changed routines.'],
  ['Rollout sequence: ', 'Validate channel estimates and static selection, establish A/B baselines, add learned probe ranking, then test guarded proactive moves.']
 ],notes:'Source: MD §§2.4, 3.5.3–3.5.4 and 3.9.1–3.9.4. Include all scanning, settling, fitting, verification and motion in elapsed-time comparisons, while counting actual useful data delivered during these intervals. Test remote improvements without incumbent degradation, demand changes without alignment changes, priority changes and environments faster than a valid comparison. Separate forecast accuracy from control value. For Scheme C, compare daily-only and weekday/weekend context, probe ranking only, full proactive movement, and removal of current-state correction. Use chronological held-out periods and rolling evaluation to avoid leakage from the same session. A deterministic historical log does not reveal unvisited orientation outcomes and cannot alone establish the benefit of a full counterfactual controller. Use controlled trace-driven simulation or prospective experiments and report trial uncertainty. No measured performance gain is claimed in this presentation.'}
];

const imported=await PresentationFile.importPptx(await FileBlob.load(sourceTemplatePath));
// Reuse the source cover and a source title/content slide, preserving their layouts and master.
const proto=imported.toProto();
proto.slides=[proto.slides[0],proto.slides[2]];
proto.slides.forEach((s,i)=>s.index=i);
const presentation=Presentation.load(proto);
const seed=presentation.slides.items[1];
for(let i=1;i<content.length;i++) seed.duplicate();

const cover=presentation.slides.items[0];
const coverTitle=cover.shapes.items.find(s=>s.name==='Title 1');
coverTitle.text='AoA Estimation and\nAntenna Orientation\nOptimization';
coverTitle.text.style={typeface:'Aptos Display',fontSize:72,color:'#000000',alignment:'center',verticalAlignment:'bottom',autoFit:'none'};
const sub=cover.shapes.items.find(s=>s.name==='Subtitle 2') ?? cover.placeholders.getItem('subtitle');
sub.text='Mechanically rotating Wi-Fi antenna\nEstimation, selection, and continuous adaptation';
sub.text.style={typeface:'Aptos',fontSize:32,color:'#000000',alignment:'center',autoFit:'none'};
cover.speakerNotes.textFrame.setText('Source: AoA_Estimation_Rotating_WiFi_Antenna_MUSIC_ESPRIT_SAGE.md. Part I covers AoA estimation with MUSIC, ESPRIT and SAGE. Part II covers orientation selection for one client, multiple clients and prioritized services. Part III covers periodic, event-triggered and predictive adaptation. These are proposed models and controller designs, not experimental performance claims.');

for(let i=0;i<content.length;i++){
 const s=presentation.slides.items[i+1]; const data=content[i];
 const title=s.shapes.items.find(x=>x.name==='Title 1');
 const body=s.shapes.items.find(x=>x.name==='Content Placeholder 2');
 title.text=data.title;
 title.text.style={typeface:'Aptos Display',fontSize:58.6667,color:'#000000',alignment:'left',verticalAlignment:'middle',autoFit:'none'};
 const paras=makeNativeBulletParagraphs(data.items.map(x=>x.join('')),{marginLeftPoints:18,hangingPoints:18,spaceAfterPoints:18});
 paras.forEach((p,k)=>{p.runs=[{run:data.items[k][0],textStyle:{bold:true,fontSize:'20pt',typeface:'Aptos'}},{run:data.items[k][1],textStyle:{fontSize:'20pt',typeface:'Aptos'}}];});
 body.text=paras;
 body.text.style={typeface:'Aptos',fontSize:26.6667,color:'#000000',alignment:'left',verticalAlignment:'top',autoFit:'none'};
 s.speakerNotes.textFrame.setText(data.notes);
}
await fs.writeFile(path.join(tmp,'authored-content.json'),JSON.stringify(content,null,2));
const candidatePath=path.join(tmp,'candidate.pptx');
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
console.log('Exported candidate',presentation.slides.items.length);
for(let i=0;i<presentation.slides.items.length;i++){
 const slide=presentation.slides.items[i];
 const png=await slide.export({format:'png',scale:1});
 await fs.writeFile(path.join(tmp,`draft-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
 const layout=await slide.export({format:'layout'});
 await fs.writeFile(path.join(tmp,`draft-${i+1}.json`),await layout.text());
}
console.log('Rendered draft');
const finalPath=path.join(workspaceDir,'output/AoA_Orientation_Optimization_Slides.pptx');
const result=await finalizePresentation({workspaceDir,candidatePath,finalPath,pythonExecutable:RUNTIME_PYTHON,
 integrityValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(SKILL_DIR,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
 requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy,sourceTemplatePath,
 verifyArtifactToolImport:true,receiptPath:path.join(tmp,'validation.json')});
console.log(JSON.stringify(result));
const final=await PresentationFile.importPptx(await FileBlob.load(finalPath));
for(let i=0;i<final.slides.items.length;i++){
 const b=await final.slides.items[i].export({format:'png',scale:1});
 await fs.writeFile(path.join(tmp,`final-${i+1}.png`),new Uint8Array(await b.arrayBuffer()));
}
console.log('Final slides rendered');
